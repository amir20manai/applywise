package com.applywise.backend.service;

import com.applywise.backend.dto.CompanyRequest;
import com.applywise.backend.dto.CompanyResponse;
import com.applywise.backend.entity.Company;
import com.applywise.backend.exception.ConflictException;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    // CREATE
    @Transactional
    public CompanyResponse create(CompanyRequest request) {

        String email = normalizeEmail(request.getEmail());

        if (companyRepository.existsByName(request.getName())) {
            throw new ConflictException("Company name already exists");
        }
        if (email != null && companyRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Company email already exists");
        }

        Company company = new Company();
        applyRequest(company, request, email);

        return toResponse(companyRepository.save(company));
    }

    // UPDATE
    @Transactional
    public CompanyResponse update(Long id, CompanyRequest request) {

        Company company = findCompany(id);
        String email = normalizeEmail(request.getEmail());

        // Nom changé ET déjà utilisé par une autre company
        if (!company.getName().equals(request.getName())
                && companyRepository.existsByName(request.getName())) {
            throw new ConflictException("Company name already exists");
        }

        // Email déjà utilisé par une AUTRE company
        if (email != null) {
            companyRepository.findByEmail(email).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new ConflictException("Company email already exists");
                }
            });
        }

        applyRequest(company, request, email);

        // Pas de save() : dirty checking
        return toResponse(company);
    }

    // DELETE
    @Transactional
    public void delete(Long id) {

        Company company = findCompany(id);

        try {
            companyRepository.delete(company);
            companyRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(
                    "Company cannot be deleted because job offers are linked to it"
            );
        }
    }

    // GET BY ID
    @Transactional(readOnly = true)
    public CompanyResponse getById(Long id) {
        return toResponse(findCompany(id));
    }

    // LIST
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAll() {
        return companyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------- méthodes privées ----------

    private Company findCompany(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    // Email vide "" -> null (sinon 2 companies avec "" violent unique)
    private String normalizeEmail(String email) {
        return (email == null || email.isBlank()) ? null : email.trim();
    }

    private void applyRequest(Company company, CompanyRequest request, String email) {
        company.setName(request.getName());
        company.setEmail(email);
        company.setWebsite(request.getWebsite());
        company.setLogo(request.getLogo());
        company.setDescription(request.getDescription());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
    }

    private CompanyResponse toResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .email(company.getEmail())
                .website(company.getWebsite())
                .logo(company.getLogo())
                .description(company.getDescription())
                .industry(company.getIndustry())
                .location(company.getLocation())
                .createdAt(company.getCreatedAt())
                .build();
    }
}