package com.applywise.backend.service;

import com.applywise.backend.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import com.applywise.backend.exception.ResourceNotFoundException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final Path uploadDir;

    public FileStorageService(@Value("${application.upload.resume-dir}") String dir) {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create upload directory", e);
        }
    }

    // Sauvegarde le fichier et retourne son nom unique sur le disque
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only PDF, DOC and DOCX files are allowed");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = original.contains(".")
                ? original.substring(original.lastIndexOf('.'))
                : "";

        String storedName = UUID.randomUUID() + extension;

        try {
            Files.copy(file.getInputStream(),
                    uploadDir.resolve(storedName),
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store file", e);
        }

        return storedName;
    }

    // Supprime le fichier du disque (ne fait rien s'il n'existe pas)
    public void delete(String storedName) {
        try {
            Files.deleteIfExists(uploadDir.resolve(storedName).normalize());
        } catch (IOException e) {
            throw new UncheckedIOException("Could not delete file", e);
        }
    }
    // Charge le fichier depuis le disque
    public Resource load(String storedName) {
        try {
            Path file = uploadDir.resolve(storedName).normalize();

            // Sécurité: le fichier doit rester dans le dossier uploads
            if (!file.startsWith(uploadDir)) {
                throw new BadRequestException("Invalid file name");
            }

            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not found on server");
            }

            return resource;

        } catch (java.net.MalformedURLException e) {
            throw new ResourceNotFoundException("File not found on server");
        }
    }
}