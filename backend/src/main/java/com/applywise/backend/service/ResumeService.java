package com.applywise.backend.service;

import com.applywise.backend.dto.ResumeResponse;
import com.applywise.backend.entity.Resume;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.ResumeRepository;
import com.applywise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    // Résultat du téléchargement: le fichier + ses infos
    public record ResumeDownload(Resource resource, String fileName, String contentType) {}

    // UPLOAD
    @Transactional
    public ResumeResponse upload(String email, MultipartFile file) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String storedName = fileStorageService.store(file);

        // Le premier CV de l'utilisateur devient automatiquement le CV par défaut
        boolean first = resumeRepository.countByUserId(user.getId()) == 0;

        Resume resume = Resume.builder()
                .fileName(file.getOriginalFilename())
                .filePath(storedName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .isDefault(first)
                .user(user)
                .build();

        return toResponse(resumeRepository.save(resume));
    }

    // LIST
    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return resumeRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // SET DEFAULT
    @Transactional
    public ResumeResponse setDefault(String email, Long resumeId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resume resume = findOwnedResume(user, resumeId);

        resumeRepository.findByUserIdAndIsDefaultTrue(user.getId())
                .ifPresent(current -> current.setDefault(false));

        resume.setDefault(true);

        return toResponse(resume);
    }

    // DELETE
    @Transactional
    public void delete(String email, Long resumeId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resume resume = findOwnedResume(user, resumeId);
        boolean wasDefault = resume.isDefault();

        resumeRepository.delete(resume);
        fileStorageService.delete(resume.getFilePath());

        // Si on supprime le CV par défaut, le plus ancien restant devient default
        if (wasDefault) {
            resumeRepository.findByUserId(user.getId()).stream()
                    .filter(r -> !r.getId().equals(resumeId))
                    .findFirst()
                    .ifPresent(r -> r.setDefault(true));
        }
    }
    // DOWNLOAD
    @Transactional(readOnly = true)
    public ResumeDownload download(String email, Long resumeId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resume resume = findOwnedResume(user, resumeId);

        Resource resource = fileStorageService.load(resume.getFilePath());

        return new ResumeDownload(resource, resume.getFileName(), resume.getFileType());
    }

    // Vérifie que le CV existe ET appartient à l'utilisateur
    private Resume findOwnedResume(User user, Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Resume not found");
        }
        return resume;
    }

    private ResumeResponse toResponse(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileType(resume.getFileType())
                .fileSize(resume.getFileSize())
                .defaultResume(resume.isDefault())
                .uploadedAt(resume.getUploadedAt())
                .build();
    }
}