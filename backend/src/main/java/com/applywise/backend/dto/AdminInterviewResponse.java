package com.applywise.backend.dto;

import com.applywise.backend.entity.InterviewStatus;

import java.time.LocalDateTime;

public record AdminInterviewResponse(
        Long id,
        String title,
        LocalDateTime scheduledAt,
        String location,
        String meetingLink,
        String notes,
        InterviewStatus status,
        LocalDateTime createdAt,
        Long applicationId,
        String jobTitle,
        String companyName,
        Long candidateId,
        String candidateName,
        String candidateEmail
) {
}