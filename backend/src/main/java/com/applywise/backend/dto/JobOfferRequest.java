package com.applywise.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class JobOfferRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 3000, message = "Description must not exceed 3000 characters")
    private String description;

    private String location;

    private String employmentType;

    private String experienceLevel;

    private String salary;

    private String sourceUrl;

    private LocalDateTime publishedAt;

    private LocalDateTime deadline;

    @NotNull(message = "Company is required")
    private Long companyId;
}