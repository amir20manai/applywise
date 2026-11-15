package com.applywise.backend.service;

import com.applywise.backend.dto.ChangePasswordRequest;
import com.applywise.backend.dto.ProfileResponse;
import com.applywise.backend.dto.UpdateProfileRequest;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.BadRequestException;
import com.applywise.backend.exception.ConflictException;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // GET
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        return toResponse(findUser(email));
    }

    // UPDATE
    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {

        User user = findUser(email);

        // Phone vide "" -> null (la colonne est unique)
        String phone = (request.getPhone() == null || request.getPhone().isBlank())
                ? null
                : request.getPhone().trim();

        // Phone changé ET déjà utilisé par un autre user
        if (phone != null
                && !phone.equals(user.getPhone())
                && userRepository.existsByPhone(phone)) {
            throw new ConflictException("Phone number is already registered");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(phone);
        user.setProfilePicture(request.getProfilePicture());

        // Pas de save() : dirty checking
        return toResponse(user);
    }

    // CHANGE PASSWORD
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {

        User user = findUser(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from the current one");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    // ---------- méthodes privées ----------

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}