package com.applywise.backend.dto;

import java.util.List;
import java.util.Map;

public record AdminStatsResponse(
        long candidates,
        long companies,
        long activeOffers,
        long totalApplications,
        long applicationsLast7Days,
        Map<String, Long> applicationsByStatus,
        List<TopOffer> topOffers
) {

    public record TopOffer(
            Long id,
            String title,
            String companyName,
            long applications
    ) {
    }
}