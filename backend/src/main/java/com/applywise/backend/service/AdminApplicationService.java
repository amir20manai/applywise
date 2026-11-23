package com.applywise.backend.service;

import com.applywise.backend.dto.AdminApplicationResponse;
import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.entity.NotificationType;
import com.applywise.backend.entity.Resume;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.BadRequestException;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.ApplicationRepository;
import com.applywise.backend.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminApplicationService {

    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    // Candidatures reçues (filtre status optionnel)
    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> list(ApplicationStatus status) {

        List<Application> applications = (status == null)
                ? applicationRepository.findAllForAdmin()
                : applicationRepository.findAllForAdminByStatus(status);

        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : interviewRepository.countGroupedByApplication()) {
            counts.put((Long) row[0], ((Number) row[1]).longValue());
        }

        return applications.stream()
                .map(a -> toResponse(a, counts.getOrDefault(a.getId(), 0L)))
                .toList();
    }

    // Change le status et prévient le candidat
    @Transactional
    public AdminApplicationResponse updateStatus(Long id, ApplicationStatus status) {

        if (status == null) {
            throw new BadRequestException("Status is required");
        }

        Application application = findPlatformApplication(id);

        if (application.getStatus() != status) {
            application.setStatus(status);

            notificationService.create(
                    application.getUser(),
                    "Application updated",
                    "Your application for " + application.getJobTitle()
                            + " at " + application.getCompanyName()
                            + " is now " + status.name().toLowerCase().replace('_', ' ') + ".",
                    NotificationType.APPLICATION_UPDATE
            );
        }

        return toResponse(application, interviewRepository.countByApplicationId(id));
    }

    // CV du candidat (pour le recruteur)
    @Transactional(readOnly = true)
    public ResumeService.ResumeDownload downloadResume(Long id) {

        Application application = findPlatformApplication(id);
        Resume resume = application.getResume();

        if (resume == null) {
            throw new ResourceNotFoundException("This application has no CV");
        }

        Resource file = fileStorageService.load(resume.getFilePath());

        return new ResumeService.ResumeDownload(file, resume.getFileName(), resume.getFileType());
    }

    // Seules les candidatures envoyées à une offre de la plateforme sont visibles par l'admin
    private Application findPlatformApplication(Long id) {
        Application application = applicationRepository.findWithUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (application.getJobOffer() == null) {
            throw new ResourceNotFoundException("Application not found");
        }
        return application;
    }

    private AdminApplicationResponse toResponse(Application application, long interviewCount) {

        User candidate = application.getUser();
        Resume resume = application.getResume();

        return new AdminApplicationResponse(
                application.getId(),
                application.getJobTitle(),
                application.getCompanyName(),
                application.getLocation(),
                application.getJobUrl(),
                application.getCoverLetter(),
                application.getStatus(),
                application.getAppliedAt(),
                candidate.getId(),
                candidate.getFirstName() + " " + candidate.getLastName(),
                candidate.getEmail(),
                candidate.getPhone(),
                resume != null ? resume.getId() : null,
                resume != null ? resume.getFileName() : null,
                interviewCount
        );
    }
}