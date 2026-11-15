package com.applywise.backend.dto;

import com.applywise.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ApplicationResponse {

    private Long id;
    private String jobTitle;
    private String companyName;
    private String jobUrl;
    private String location;
    private String notes;
    private String coverLetter;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    // Offre liée (nullable)
    private Long jobOfferId;

    // CV utilisé (nullable)
    private Long resumeId;
    private String resumeFileName;
}