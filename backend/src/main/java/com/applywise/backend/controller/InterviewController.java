package com.applywise.backend.controller;

import com.applywise.backend.dto.InterviewRequest;
import com.applywise.backend.dto.InterviewResponse;
import com.applywise.backend.dto.InterviewStatusRequest;
import com.applywise.backend.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    // CREATE (sur une candidature)
    @PostMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<InterviewResponse> create(
            @PathVariable Long applicationId,
            @Valid @RequestBody InterviewRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(interviewService.create(authentication.getName(), applicationId, request));
    }

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

    // UPDATE
    @PutMapping("/interviews/{id}")
    public ResponseEntity<InterviewResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.update(authentication.getName(), id, request));
    }

    // UPDATE STATUS
    @PatchMapping("/interviews/{id}/status")
    public ResponseEntity<InterviewResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody InterviewStatusRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.updateStatus(
                        authentication.getName(), id, request.getStatus()));
    }

    // DELETE
    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        interviewService.delete(authentication.getName(), id);

        return ResponseEntity.noContent().build();
    }
}