package com.applywise.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CoverLetterRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 255, message = "Job title must not exceed 255 characters")
    private String jobTitle;

    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name must not exceed 255 characters")
    private String companyName;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    // Ce que le candidat veut mettre en avant (compétences, projets...)
    @Size(max = 1500, message = "Highlights must not exceed 1500 characters")
    private String highlights;

    // "en" ou "fr" (anglais par défaut)
    @Pattern(regexp = "en|fr", message = "Language must be en or fr")
    private String language;
}