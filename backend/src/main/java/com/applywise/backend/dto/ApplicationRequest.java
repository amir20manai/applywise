package com.applywise.backend.dto;

import com.applywise.backend.entity.ApplicationStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApplicationRequest {

    // Obligatoires ken ma famech jobOfferId (validation fil service)
    @Size(max = 255, message = "Job title must not exceed 255 characters")
    private String jobTitle;

    @Size(max = 255, message = "Company name must not exceed 255 characters")
    private String companyName;

    private String jobUrl;

    private String location;

    @Size(max = 3000, message = "Notes must not exceed 3000 characters")
    private String notes;

    @Size(max = 3000, message = "Cover letter must not exceed 3000 characters")
    private String coverLetter;

    // Optionnel: si null, le backend met PENDING
    private ApplicationStatus status;

    // Optionnel: offre de la plateforme
    private Long jobOfferId;

    // Optionnel: CV utilisé
    private Long resumeId;
}