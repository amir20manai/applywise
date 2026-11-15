package com.applywise.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CompanyResponse {

    private Long id;
    private String name;
    private String email;
    private String website;
    private String logo;
    private String description;
    private String industry;
    private String location;
    private LocalDateTime createdAt;
}