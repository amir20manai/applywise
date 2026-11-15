package com.applywise.backend.controller;

import com.applywise.backend.ai.CoverLetterService;
import com.applywise.backend.ai.FollowUpService;
import com.applywise.backend.ai.InterviewPrepService;
import com.applywise.backend.dto.CoverLetterRequest;
import com.applywise.backend.dto.CoverLetterResponse;
import com.applywise.backend.dto.FollowUpRequest;
import com.applywise.backend.dto.FollowUpResponse;
import com.applywise.backend.dto.InterviewPrepResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final CoverLetterService coverLetterService;
    private final InterviewPrepService interviewPrepService;
    private final FollowUpService followUpService;

    @PostMapping("/cover-letter")
    public ResponseEntity<CoverLetterResponse> coverLetter(
            @Valid @RequestBody CoverLetterRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                coverLetterService.generate(authentication.getName(), request));
    }

    @PostMapping("/interviews/{interviewId}/prepare")
    public ResponseEntity<InterviewPrepResponse> prepareInterview(
            @PathVariable Long interviewId,
            @RequestParam(defaultValue = "en") String language,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewPrepService.prepare(authentication.getName(), interviewId, language));
    }

    @PostMapping("/applications/{applicationId}/follow-up")
    public ResponseEntity<FollowUpResponse> followUp(
            @PathVariable Long applicationId,
            @Valid @RequestBody FollowUpRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                followUpService.write(authentication.getName(), applicationId, request));
    }
}