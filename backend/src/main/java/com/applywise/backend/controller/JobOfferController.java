package com.applywise.backend.controller;

import com.applywise.backend.dto.JobOfferRequest;
import com.applywise.backend.dto.JobOfferResponse;
import com.applywise.backend.service.JobOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-offers")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService jobOfferService;

    // SEARCH / LIST
    @GetMapping
    public ResponseEntity<List<JobOfferResponse>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location) {

        return ResponseEntity.ok(jobOfferService.search(title, location));
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<JobOfferResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<JobOfferResponse> create(
            @Valid @RequestBody JobOfferRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(jobOfferService.create(request));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<JobOfferResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody JobOfferRequest request) {

        return ResponseEntity.ok(jobOfferService.update(id, request));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        jobOfferService.delete(id);

        return ResponseEntity.noContent().build();
    }
}