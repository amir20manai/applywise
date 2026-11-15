package com.applywise.backend.dto;

import com.applywise.backend.entity.InterviewStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class InterviewRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private LocalDateTime scheduledAt;

    private String location;

    private String meetingLink;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    // Optionnel: si null, le backend met SCHEDULED
    private InterviewStatus status;
}