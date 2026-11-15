package com.applywise.backend.repository;

import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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

    // Charge la candidature avec son utilisateur en une seule requête
    @Query("select a from Application a join fetch a.user where a.id = :id")
    Optional<Application> findWithUserById(@Param("id") Long id);
}