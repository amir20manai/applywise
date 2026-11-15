package com.applywise.backend.repository;

import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserId(Long userId);

    List<Application> findByUserIdAndStatus(
            Long userId,
            ApplicationStatus status
    );

    List<Application> findByJobOfferId(Long jobOfferId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(
            Long userId,
            ApplicationStatus status
    );

    boolean existsByUserIdAndJobOfferId(Long userId, Long jobOfferId);
}