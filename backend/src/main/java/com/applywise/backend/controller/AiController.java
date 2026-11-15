package com.applywise.backend.controller;

import com.applywise.backend.ai.CoverLetterService;
import com.applywise.backend.dto.CoverLetterRequest;
import com.applywise.backend.dto.CoverLetterResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final CoverLetterService coverLetterService;

    @PostMapping("/cover-letter")
    public ResponseEntity<CoverLetterResponse> coverLetter(
            @Valid @RequestBody CoverLetterRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                coverLetterService.generate(authentication.getName(), request));
    }
}