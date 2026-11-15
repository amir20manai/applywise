package com.applywise.backend.dto;

import com.applywise.backend.entity.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class JobOfferResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private String employmentType;
    private String experienceLevel;
    private String salary;
    private String sourceUrl;
    private LocalDateTime publishedAt;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private OfferStatus status;

    // Infos de la company (à plat)
    private Long companyId;
    private String companyName;
    private String companyLogo;
}