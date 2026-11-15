package com.applywise.backend.dto;

import com.applywise.backend.entity.InterviewStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InterviewStatusRequest {

    @NotNull(message = "Status is required")
    private InterviewStatus status;
}