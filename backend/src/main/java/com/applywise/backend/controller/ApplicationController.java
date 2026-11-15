package com.applywise.backend.controller;

import com.applywise.backend.dto.ApplicationRequest;
import com.applywise.backend.dto.ApplicationResponse;
import com.applywise.backend.dto.ApplicationStatusRequest;
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

    // CREATE
    @PostMapping
    public ResponseEntity<ApplicationResponse> create(
            @Valid @RequestBody ApplicationRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(applicationService.create(authentication.getName(), request));
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

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.update(authentication.getName(), id, request)
        );
    }

    // UPDATE STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.updateStatus(
                        authentication.getName(), id, request.getStatus())
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        applicationService.delete(authentication.getName(), id);

        return ResponseEntity.noContent().build();
    }
}