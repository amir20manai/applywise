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
public class FollowUpRequest {

    // "follow_up" = relance, "thank_you" = remerciement après un entretien
    @NotBlank(message = "Type of email is required")
    @Pattern(regexp = "follow_up|thank_you", message = "Type must be follow_up or thank_you")
    private String purpose;

    // "en" ou "fr" (anglais par défaut)
    @Pattern(regexp = "en|fr", message = "Language must be en or fr")
    private String language;

    // Précisions du candidat (ex: nom du recruteur, sujet abordé en entretien)
    @Size(max = 1000, message = "Details must not exceed 1000 characters")
    private String details;
}