package com.applywise.backend.dto;

import com.applywise.backend.entity.InterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class InterviewResponse {

    private Long id;
    private String title;
    private LocalDateTime scheduledAt;
    private String location;
    private String meetingLink;
    private String notes;
    private InterviewStatus status;
    private LocalDateTime createdAt;

    // Infos de la candidature (à plat)
    private Long applicationId;
    private String jobTitle;
    private String companyName;
}