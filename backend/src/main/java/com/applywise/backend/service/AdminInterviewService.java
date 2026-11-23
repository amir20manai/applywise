package com.applywise.backend.service;

import com.applywise.backend.dto.AdminInterviewResponse;
import com.applywise.backend.dto.InterviewRequest;
import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.entity.Interview;
import com.applywise.backend.entity.InterviewStatus;
import com.applywise.backend.entity.NotificationType;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.BadRequestException;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.ApplicationRepository;
import com.applywise.backend.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminInterviewService {

    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Si la candidature en est encore là, planifier un entretien la fait passer à INTERVIEW
    private static final Set<ApplicationStatus> BEFORE_INTERVIEW = EnumSet.of(
            ApplicationStatus.PENDING, ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW);

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    // Tous les entretiens, les plus proches d'abord (sans date à la fin)
    @Transactional(readOnly = true)
    public List<AdminInterviewResponse> list() {
        return interviewRepository.findAllForAdmin().stream()
                .sorted(Comparator.comparing(
                        Interview::getScheduledAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminInterviewResponse create(Long applicationId, InterviewRequest request) {

        Application application = findPlatformApplication(applicationId);

        Interview interview = new Interview();
        interview.setApplication(application);
        applyRequest(interview, request);
        interview.setStatus(request.getStatus());   // null -> SCHEDULED (@PrePersist)

        Interview saved = interviewRepository.save(interview);

        if (BEFORE_INTERVIEW.contains(application.getStatus())) {
            application.setStatus(ApplicationStatus.INTERVIEW);
        }

        notify(application.getUser(), "Interview scheduled",
                "An interview was scheduled for your application to " + describe(application)
                        + ": " + saved.getTitle() + when(saved) + ".");

        return toResponse(saved);
    }

    @Transactional
    public AdminInterviewResponse update(Long id, InterviewRequest request) {

        Interview interview = findInterview(id);
        LocalDateTime before = interview.getScheduledAt();

        applyRequest(interview, request);

        if (request.getStatus() != null) {
            interview.setStatus(request.getStatus());
        }

        // Nouvelle date: le rappel automatique doit être renvoyé
        if (!Objects.equals(before, interview.getScheduledAt())) {
            interview.setReminderSent(false);
        }

        notify(interview.getApplication().getUser(), "Interview updated",
                "Your interview for " + describe(interview.getApplication())
                        + " was updated: " + interview.getTitle() + when(interview) + ".");

        return toResponse(interview);
    }

    @Transactional
    public AdminInterviewResponse updateStatus(Long id, InterviewStatus status) {

        if (status == null) {
            throw new BadRequestException("Status is required");
        }

        Interview interview = findInterview(id);

        if (interview.getStatus() != status) {
            interview.setStatus(status);

            notify(interview.getApplication().getUser(), "Interview updated",
                    "Your interview \"" + interview.getTitle() + "\" for "
                            + describe(interview.getApplication()) + " is now "
                            + status.name().toLowerCase() + ".");
        }

        return toResponse(interview);
    }

    @Transactional
    public void delete(Long id) {

        Interview interview = findInterview(id);

        notify(interview.getApplication().getUser(), "Interview cancelled",
                "Your interview \"" + interview.getTitle() + "\" for "
                        + describe(interview.getApplication()) + " was cancelled.");

        interviewRepository.delete(interview);
    }

    // ---------- méthodes privées ----------

    // Seules les candidatures envoyées à une offre de la plateforme sont visibles par l'admin
    private Application findPlatformApplication(Long id) {
        Application application = applicationRepository.findWithUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (application.getJobOffer() == null) {
            throw new ResourceNotFoundException("Application not found");
        }
        return application;
    }

    private Interview findInterview(Long id) {
        Interview interview = interviewRepository.findWithApplicationAndUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (interview.getApplication().getJobOffer() == null) {
            throw new ResourceNotFoundException("Interview not found");
        }
        return interview;
    }

    private void applyRequest(Interview interview, InterviewRequest request) {
        interview.setTitle(request.getTitle());
        interview.setScheduledAt(request.getScheduledAt());
        interview.setLocation(request.getLocation());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setNotes(request.getNotes());
    }

    private void notify(User candidate, String title, String message) {
        notificationService.create(candidate, title, message, NotificationType.APPLICATION_UPDATE);
    }

    private String describe(Application application) {
        return application.getJobTitle() + " at " + application.getCompanyName();
    }

    private String when(Interview interview) {
        return interview.getScheduledAt() == null
                ? ""
                : " on " + interview.getScheduledAt().format(FORMAT);
    }

    private AdminInterviewResponse toResponse(Interview interview) {

        Application application = interview.getApplication();
        User candidate = application.getUser();

        return new AdminInterviewResponse(
                interview.getId(),
                interview.getTitle(),
                interview.getScheduledAt(),
                interview.getLocation(),
                interview.getMeetingLink(),
                interview.getNotes(),
                interview.getStatus(),
                interview.getCreatedAt(),
                application.getId(),
                application.getJobTitle(),
                application.getCompanyName(),
                candidate.getId(),
                candidate.getFirstName() + " " + candidate.getLastName(),
                candidate.getEmail()
        );
    }
}