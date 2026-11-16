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
public class OfferDescriptionRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 255, message = "Job title must not exceed 255 characters")
    private String title;

    @Size(max = 255, message = "Company name must not exceed 255 characters")
    private String companyName;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    // Compétences, missions, avantages à mentionner
    @Size(max = 1000, message = "Keywords must not exceed 1000 characters")
    private String keywords;

    // "en" ou "fr" (anglais par défaut)
    @Pattern(regexp = "en|fr", message = "Language must be en or fr")
    private String language;
}