package com.applywise.backend.service;

import com.applywise.backend.dto.DashboardResponse;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.entity.InterviewStatus;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.ApplicationRepository;
import com.applywise.backend.repository.InterviewRepository;
import com.applywise.backend.repository.ResumeRepository;
import com.applywise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long userId = user.getId();

        // Compteur par status (tous les status, même ceux à 0)
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            byStatus.put(
                    status.name(),
                    applicationRepository.countByUserIdAndStatus(userId, status)
            );
        }

        // Entretiens à venir: SCHEDULED/RESCHEDULED avec date future
        LocalDateTime now = LocalDateTime.now();
        long upcoming = interviewRepository.findByApplicationUserId(userId).stream()
                .filter(i -> i.getScheduledAt() != null && i.getScheduledAt().isAfter(now))
                .filter(i -> i.getStatus() == InterviewStatus.SCHEDULED
                        || i.getStatus() == InterviewStatus.RESCHEDULED)
                .count();

        return DashboardResponse.builder()
                .totalApplications(applicationRepository.countByUserId(userId))
                .applicationsByStatus(byStatus)
                .upcomingInterviews(upcoming)
                .resumesCount(resumeRepository.countByUserId(userId))
                .build();
    }
}