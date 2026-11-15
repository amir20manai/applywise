package com.applywise.backend.controller;

import com.applywise.backend.dto.ChangePasswordRequest;
import com.applywise.backend.dto.ProfileResponse;
import com.applywise.backend.dto.UpdateProfileRequest;
import com.applywise.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // GET
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfile(authentication.getName()));
    }

    // UPDATE
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                profileService.updateProfile(authentication.getName(), request));
    }

    // CHANGE PASSWORD
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        profileService.changePassword(authentication.getName(), request);

        return ResponseEntity.noContent().build();
    }
}