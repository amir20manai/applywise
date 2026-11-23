package com.applywise.backend.controller;

import com.applywise.backend.dto.InterviewResponse;
import com.applywise.backend.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Lecture seule: les entretiens sont gérés par le recruteur (voir AdminRecruitmentController)
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    // LIST par candidature
    @GetMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<List<InterviewResponse>> getByApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.getByApplication(authentication.getName(), applicationId));
    }

    // LIST de tous mes entretiens
    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewResponse>> getMyInterviews(
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.getMyInterviews(authentication.getName()));
    }
}