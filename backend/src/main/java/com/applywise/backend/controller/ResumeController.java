package com.applywise.backend.controller;

import com.applywise.backend.dto.ResumeResponse;
import com.applywise.backend.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    // UPLOAD
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        ResumeResponse response =
                resumeService.upload(authentication.getName(), file);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // LIST
    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            Authentication authentication) {

        return ResponseEntity.ok(
                resumeService.getMyResumes(authentication.getName())
        );
    }

    // SET DEFAULT
    @PutMapping("/{id}/default")
    public ResponseEntity<ResumeResponse> setDefault(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                resumeService.setDefault(authentication.getName(), id)
        );
    }
    // DOWNLOAD
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            Authentication authentication) {

        ResumeService.ResumeDownload file =
                resumeService.download(authentication.getName(), id);

        MediaType mediaType = file.contentType() != null
                ? MediaType.parseMediaType(file.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.fileName(), java.nio.charset.StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(file.resource());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        resumeService.delete(authentication.getName(), id);

        return ResponseEntity.noContent().build();
    }
}