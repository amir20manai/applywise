package com.applywise.backend.dto;

import com.applywise.backend.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApplicationStatusRequest {

    @NotNull(message = "Status is required")
    private ApplicationStatus status;
}