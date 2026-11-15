package com.applywise.backend.service;

import com.applywise.backend.dto.ApplicationRequest;
import com.applywise.backend.dto.ApplicationResponse;
import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.entity.JobOffer;
import com.applywise.backend.entity.Resume;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.BadRequestException;
import com.applywise.backend.exception.ConflictException;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.ApplicationRepository;
import com.applywise.backend.repository.JobOfferRepository;
import com.applywise.backend.repository.ResumeRepository;
import com.applywise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.applywise.backend.entity.NotificationType;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationService notificationService;
    // CREATE
    @Transactional
    public ApplicationResponse create(String email, ApplicationRequest request) {

        User user = findUser(email);

        Application application = new Application();
        application.setUser(user);

        if (request.getJobOfferId() != null) {

            // Une seule candidature par offre pour chaque utilisateur
            if (applicationRepository.existsByUserIdAndJobOfferId(
                    user.getId(), request.getJobOfferId())) {
                throw new ConflictException("You already applied to this offer");
            }

            // Candidature sur une offre de la plateforme
            JobOffer offer = jobOfferRepository.findById(request.getJobOfferId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job offer not found"));

            application.setJobOffer(offer);
            application.setJobTitle(offer.getTitle());
            application.setCompanyName(
                    offer.getCompany() != null
                            ? offer.getCompany().getName()
                            : request.getCompanyName()
            );
            application.setLocation(
                    isBlank(request.getLocation()) ? offer.getLocation() : request.getLocation()
            );
            application.setJobUrl(
                    isBlank(request.getJobUrl()) ? offer.getSourceUrl() : request.getJobUrl()
            );
        } else {
            // Candidature sur une offre externe (LinkedIn...)
            if (isBlank(request.getJobTitle()) || isBlank(request.getCompanyName())) {
                throw new BadRequestException(
                        "Job title and company name are required when no job offer is selected"
                );
            }
            application.setJobTitle(request.getJobTitle());
            application.setCompanyName(request.getCompanyName());
            application.setLocation(request.getLocation());
            application.setJobUrl(request.getJobUrl());
        }

        if (isBlank(application.getCompanyName())) {
            throw new BadRequestException("Company name is required");
        }

        application.setNotes(request.getNotes());
        application.setCoverLetter(request.getCoverLetter());
        application.setStatus(request.getStatus());   // null -> PENDING (@PrePersist)

        if (request.getResumeId() != null) {
            application.setResume(findOwnedResume(user, request.getResumeId()));
        }

        return toResponse(applicationRepository.save(application));
    }

    // LIST (filtre status optionnel, les plus récentes d'abord)
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(String email, ApplicationStatus status) {

        User user = findUser(email);

        List<Application> applications = (status == null)
                ? applicationRepository.findByUserId(user.getId())
                : applicationRepository.findByUserIdAndStatus(user.getId(), status);

        return applications.stream()
                .sorted(Comparator.comparing(Application::getAppliedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    // GET BY ID
    @Transactional(readOnly = true)
    public ApplicationResponse getById(String email, Long id) {
        User user = findUser(email);
        return toResponse(findOwnedApplication(user, id));
    }

    // UPDATE
    @Transactional
    public ApplicationResponse update(String email, Long id, ApplicationRequest request) {

        User user = findUser(email);
        Application application = findOwnedApplication(user, id);

        if (!isBlank(request.getJobTitle())) {
            application.setJobTitle(request.getJobTitle());
        }
        if (!isBlank(request.getCompanyName())) {
            application.setCompanyName(request.getCompanyName());
        }

        application.setJobUrl(request.getJobUrl());
        application.setLocation(request.getLocation());
        application.setNotes(request.getNotes());
        application.setCoverLetter(request.getCoverLetter());

        if (request.getStatus() != null) {
            changeStatus(application, request.getStatus());
        }
        if (request.getResumeId() != null) {
            application.setResume(findOwnedResume(user, request.getResumeId()));
        }

        // Pas de save() : dirty checking
        return toResponse(application);
    }

    // UPDATE STATUS
    @Transactional
    public ApplicationResponse updateStatus(String email, Long id, ApplicationStatus status) {

        if (status == null) {
            throw new BadRequestException("Status is required");
        }

        User user = findUser(email);
        Application application = findOwnedApplication(user, id);

        changeStatus(application, status);

        return toResponse(application);
    }

    // DELETE
    @Transactional
    public void delete(String email, Long id) {

        User user = findUser(email);
        Application application = findOwnedApplication(user, id);

        try {
            applicationRepository.delete(application);
            applicationRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(
                    "Application cannot be deleted because interviews are linked to it"
            );
        }
    }

    // ---------- méthodes privées ----------
    // Change le status et crée une notification (seulement si le status a vraiment changé)
    private void changeStatus(Application application, ApplicationStatus newStatus) {

        ApplicationStatus oldStatus = application.getStatus();

        if (oldStatus == newStatus) {
            return;
        }

        application.setStatus(newStatus);

        notificationService.create(
                application.getUser(),
                "Application updated",
                "Your application for " + application.getJobTitle()
                        + " at " + application.getCompanyName()
                        + " is now " + newStatus.name(),
                NotificationType.APPLICATION_UPDATE
        );
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Vérifie que la candidature existe ET appartient à l'utilisateur
    private Application findOwnedApplication(User user, Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Application not found");
        }
        return application;
    }

    // Vérifie que le CV existe ET appartient à l'utilisateur
    private Resume findOwnedResume(User user, Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Resume not found");
        }
        return resume;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private ApplicationResponse toResponse(Application application) {

        JobOffer offer = application.getJobOffer();   // peut être null
        Resume resume = application.getResume();      // peut être null

        return ApplicationResponse.builder()
                .id(application.getId())
                .jobTitle(application.getJobTitle())
                .companyName(application.getCompanyName())
                .jobUrl(application.getJobUrl())
                .location(application.getLocation())
                .notes(application.getNotes())
                .coverLetter(application.getCoverLetter())
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .updatedAt(application.getUpdatedAt())
                .jobOfferId(offer != null ? offer.getId() : null)
                .resumeId(resume != null ? resume.getId() : null)
                .resumeFileName(resume != null ? resume.getFileName() : null)
                .build();
    }
}