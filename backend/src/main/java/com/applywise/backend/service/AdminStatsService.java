package com.applywise.backend.service;

import com.applywise.backend.dto.AdminStatsResponse;
import com.applywise.backend.dto.AdminStatsResponse.TopOffer;
import com.applywise.backend.entity.ApplicationStatus;
import com.applywise.backend.entity.OfferStatus;
import com.applywise.backend.entity.Role;
import com.applywise.backend.repository.ApplicationRepository;
import com.applywise.backend.repository.CompanyRepository;
import com.applywise.backend.repository.JobOfferRepository;
import com.applywise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {

        // Seulement les candidatures envoyées à une offre de la plateforme
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            byStatus.put(status.name(),
                    applicationRepository.countByJobOfferIsNotNullAndStatus(status));
        }

        List<TopOffer> topOffers = applicationRepository.findTopOffers(PageRequest.of(0, 5))
                .stream()
                .map(row -> new TopOffer(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue()
                ))
                .toList();

        return new AdminStatsResponse(
                userRepository.countByRole(Role.CANDIDATE),
                companyRepository.count(),
                jobOfferRepository.countByStatus(OfferStatus.ACTIVE),
                applicationRepository.countByJobOfferIsNotNull(),
                applicationRepository.countByJobOfferIsNotNullAndAppliedAtAfter(
                        LocalDateTime.now().minusDays(7)),
                byStatus,
                topOffers
        );
    }
}