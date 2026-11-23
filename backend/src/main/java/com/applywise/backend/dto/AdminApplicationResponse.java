package com.applywise.backend.dto;

import com.applywise.backend.entity.ApplicationStatus;

import java.time.LocalDateTime;

public record AdminApplicationResponse(
        Long id,
        String jobTitle,
        String companyName,
        String location,
        String jobUrl,
        String coverLetter,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        Long candidateId,
        String candidateName,
        String candidateEmail,
        String candidatePhone,
        Long resumeId,
        String resumeFileName,
        long interviewCount
) {
}