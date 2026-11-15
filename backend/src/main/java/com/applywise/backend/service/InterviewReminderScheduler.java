package com.applywise.backend.service;

import com.applywise.backend.entity.Interview;
import com.applywise.backend.entity.InterviewStatus;
import com.applywise.backend.entity.NotificationType;
import com.applywise.backend.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewReminderScheduler {

    private static final DateTimeFormatter FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final InterviewRepository interviewRepository;
    private final NotificationService notificationService;

    // Toutes les heures (au début de l'heure)
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void sendInterviewReminders() {

        LocalDateTime now = LocalDateTime.now();

        List<Interview> upcoming = interviewRepository
                .findByStatusInAndReminderSentFalseAndScheduledAtBetween(
                        List.of(InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED),
                        now,
                        now.plusHours(24)
                );

        for (Interview interview : upcoming) {

            notificationService.create(
                    interview.getApplication().getUser(),
                    "Interview reminder",
                    "Reminder: \"" + interview.getTitle() + "\" at "
                            + interview.getApplication().getCompanyName()
                            + " on " + interview.getScheduledAt().format(FORMAT),
                    NotificationType.INTERVIEW_REMINDER
            );

            interview.setReminderSent(true);
        }
    }
}