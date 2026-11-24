package com.applywise.backend.controller;

import com.applywise.backend.dto.ApplicationResponse;
import com.applywise.backend.dto.ApplyRequest;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // APPLY (candidature à une offre)
    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(
            @Valid @RequestBody ApplyRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(applicationService.apply(authentication.getName(), request));
    }

    // LIST (?status=APPLIED optionnel)
    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @RequestParam(required = false) ApplicationStatus status,
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.getMyApplications(authentication.getName(), status)
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getById(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.getById(authentication.getName(), id)
        );
    }

    // WITHDRAW
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationResponse> withdraw(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.withdraw(authentication.getName(), id)
        );
    }
}