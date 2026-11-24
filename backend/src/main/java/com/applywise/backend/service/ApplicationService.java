package com.applywise.backend.service;

import com.applywise.backend.dto.ApplicationResponse;
import com.applywise.backend.dto.ApplyRequest;
import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.entity.JobOffer;
import com.applywise.backend.entity.NotificationType;
import com.applywise.backend.entity.OfferStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

// Le candidat envoie sa candidature à une offre, puis la suit. Le recruteur décide
// (voir AdminApplicationService): le candidat peut seulement retirer la sienne.
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private static final Set<ApplicationStatus> WITHDRAWABLE = EnumSet.of(
            ApplicationStatus.APPLIED,
            ApplicationStatus.UNDER_REVIEW,
            ApplicationStatus.INTERVIEW);

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationService notificationService;

    // APPLY
    @Transactional
    public ApplicationResponse apply(String email, ApplyRequest request) {

        User user = findUser(email);

        JobOffer offer = jobOfferRepository.findWithCompanyById(request.getJobOfferId())
                .orElseThrow(() -> new ResourceNotFoundException("Job offer not found"));

        boolean closed = offer.getStatus() != OfferStatus.ACTIVE
                || (offer.getDeadline() != null && offer.getDeadline().isBefore(LocalDateTime.now()));
        if (closed) {
            throw new BadRequestException("This offer is no longer open");
        }

        if (applicationRepository.existsByUserIdAndJobOfferId(user.getId(), offer.getId())) {
            throw new ConflictException("You already applied to this offer");
        }

        Resume resume = findOwnedResume(user, request.getResumeId());

        Application application = new Application();
        application.setUser(user);
        application.setJobOffer(offer);
        application.setJobTitle(offer.getTitle());
        application.setCompanyName(
                offer.getCompany() != null ? offer.getCompany().getName() : "Company not listed");
        application.setLocation(offer.getLocation());
        application.setJobUrl(offer.getSourceUrl());

        application.setApplicantFirstName(request.getFirstName().trim());
        application.setApplicantLastName(request.getLastName().trim());
        application.setApplicantEmail(request.getEmail().trim());
        application.setApplicantPhone(request.getPhone().trim());

        String letter = request.getCoverLetter();
        application.setCoverLetter(letter == null || letter.isBlank() ? null : letter.trim());

        application.setResume(resume);
        application.setStatus(ApplicationStatus.APPLIED);

        Application saved = applicationRepository.save(application);

        notificationService.create(
                user,
                "Application sent",
                "Your application for " + saved.getJobTitle() + " at " + saved.getCompanyName()
                        + " was sent. You will be notified when the recruiter answers.",
                NotificationType.APPLICATION_UPDATE
        );

        return toResponse(saved);
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

    // WITHDRAW
    @Transactional
    public ApplicationResponse withdraw(String email, Long id) {

        User user = findUser(email);
        Application application = findOwnedApplication(user, id);

        if (!WITHDRAWABLE.contains(application.getStatus())) {
            throw new BadRequestException("This application can no longer be withdrawn");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);

        return toResponse(application);
    }

    // ---------- méthodes privées ----------

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

    private ApplicationResponse toResponse(Application application) {

        JobOffer offer = application.getJobOffer();   // peut être null (anciennes données)
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