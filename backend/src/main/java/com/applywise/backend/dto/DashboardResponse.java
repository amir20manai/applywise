package com.applywise.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
@AllArgsConstructor
public class DashboardResponse {

    private long totalApplications;
    private Map<String, Long> applicationsByStatus;
    private long upcomingInterviews;
    private long resumesCount;
}