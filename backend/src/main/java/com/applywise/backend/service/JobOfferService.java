package com.applywise.backend.service;

import com.applywise.backend.dto.JobOfferRequest;
import com.applywise.backend.dto.JobOfferResponse;
import com.applywise.backend.entity.Company;
import com.applywise.backend.entity.JobOffer;
import com.applywise.backend.entity.OfferStatus;
import com.applywise.backend.exception.ConflictException;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.CompanyRepository;
import com.applywise.backend.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final CompanyRepository companyRepository;

    // CREATE
    @Transactional
    public JobOfferResponse create(JobOfferRequest request) {

        Company company = findCompany(request.getCompanyId());

        JobOffer offer = new JobOffer();
        applyRequest(offer, request, company);

        return toResponse(jobOfferRepository.save(offer));
    }

    // UPDATE
    @Transactional
    public JobOfferResponse update(Long id, JobOfferRequest request) {

        JobOffer offer = findOffer(id);
        Company company = findCompany(request.getCompanyId());

        applyRequest(offer, request, company);

        // Pas de save() : Hibernate détecte le changement (dirty checking)
        return toResponse(offer);
    }

    // DELETE
    @Transactional
    public void delete(Long id) {

        JobOffer offer = findOffer(id);

        try {
            jobOfferRepository.delete(offer);
            jobOfferRepository.flush();
        } catch (DataIntegrityViolationException e) {
            // Des candidatures (Application) pointent vers cette offre
            throw new ConflictException(
                    "Offer cannot be deleted because applications are linked to it"
            );
        }
    }

    // GET BY ID
    @Transactional(readOnly = true)
    public JobOfferResponse getById(Long id) {
        return toResponse(findOffer(id));
    }

    // SEARCH (titre OU location, sinon toutes les offres ACTIVE)
    @Transactional(readOnly = true)
    public List<JobOfferResponse> search(String title, String location) {

        List<JobOffer> offers;

        if (title != null && !title.isBlank()) {
            offers = jobOfferRepository.findByTitleContainingIgnoreCase(title);
        } else if (location != null && !location.isBlank()) {
            offers = jobOfferRepository.findByLocationContainingIgnoreCase(location);
        } else {
            offers = jobOfferRepository.findByStatus(OfferStatus.ACTIVE);
        }

        return offers.stream().map(this::toResponse).toList();
    }

    // ---------- méthodes privées ----------

    private JobOffer findOffer(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job offer not found"));
    }

    private Company findCompany(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    private void applyRequest(JobOffer offer, JobOfferRequest request, Company company) {
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setLocation(request.getLocation());
        offer.setEmploymentType(request.getEmploymentType());
        offer.setExperienceLevel(request.getExperienceLevel());
        offer.setSalary(request.getSalary());
        offer.setSourceUrl(request.getSourceUrl());
        offer.setPublishedAt(request.getPublishedAt());
        offer.setDeadline(request.getDeadline());
        offer.setCompany(company);
    }

    private JobOfferResponse toResponse(JobOffer offer) {

        Company company = offer.getCompany();   // peut être null

        return JobOfferResponse.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .location(offer.getLocation())
                .employmentType(offer.getEmploymentType())
                .experienceLevel(offer.getExperienceLevel())
                .salary(offer.getSalary())
                .sourceUrl(offer.getSourceUrl())
                .publishedAt(offer.getPublishedAt())
                .deadline(offer.getDeadline())
                .createdAt(offer.getCreatedAt())
                .status(offer.getStatus())
                .companyId(company != null ? company.getId() : null)
                .companyName(company != null ? company.getName() : null)
                .companyLogo(company != null ? company.getLogo() : null)
                .build();
    }
}