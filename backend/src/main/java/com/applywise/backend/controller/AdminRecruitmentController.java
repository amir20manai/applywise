package com.applywise.backend.controller;

import com.applywise.backend.dto.AdminApplicationResponse;
import com.applywise.backend.dto.AdminInterviewResponse;
import com.applywise.backend.dto.ApplicationStatusRequest;
import com.applywise.backend.dto.InterviewRequest;
import com.applywise.backend.dto.InterviewStatusRequest;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.service.AdminApplicationService;
import com.applywise.backend.service.AdminInterviewService;
import com.applywise.backend.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

// Toutes ces routes sont réservées à l'ADMIN (voir SecurityConfig: /api/admin/**)
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminRecruitmentController {

    private final AdminApplicationService applicationService;
    private final AdminInterviewService interviewService;

    // ---------- Candidatures reçues ----------

    @GetMapping("/applications")
    public ResponseEntity<List<AdminApplicationResponse>> applications(
            @RequestParam(required = false) ApplicationStatus status) {

        return ResponseEntity.ok(applicationService.list(status));
    }

    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<AdminApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusRequest request) {

        return ResponseEntity.ok(applicationService.updateStatus(id, request.getStatus()));
    }

    @GetMapping("/applications/{id}/resume")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id) {

        ResumeService.ResumeDownload file = applicationService.downloadResume(id);

        MediaType mediaType = file.contentType() != null
                ? MediaType.parseMediaType(file.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.fileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(file.resource());
    }

    // ---------- Entretiens ----------

    @GetMapping("/interviews")
    public ResponseEntity<List<AdminInterviewResponse>> interviews() {
        return ResponseEntity.ok(interviewService.list());
    }

    @PostMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<AdminInterviewResponse> createInterview(
            @PathVariable Long applicationId,
            @Valid @RequestBody InterviewRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(interviewService.create(applicationId, request));
    }

    @PutMapping("/interviews/{id}")
    public ResponseEntity<AdminInterviewResponse> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request) {

        return ResponseEntity.ok(interviewService.update(id, request));
    }

    @PatchMapping("/interviews/{id}/status")
    public ResponseEntity<AdminInterviewResponse> updateInterviewStatus(
            @PathVariable Long id,
            @Valid @RequestBody InterviewStatusRequest request) {

        return ResponseEntity.ok(interviewService.updateStatus(id, request.getStatus()));
    }

    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}