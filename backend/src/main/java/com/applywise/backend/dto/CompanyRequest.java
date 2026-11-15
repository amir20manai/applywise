package com.applywise.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Email(message = "Email must be valid")
    private String email;

    private String website;

    private String logo;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String industry;

    private String location;
}