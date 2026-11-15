package com.applywise.backend.repository;

import com.applywise.backend.entity.Interview;
import com.applywise.backend.entity.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationUserId(Long userId);

    List<Interview> findByStatus(InterviewStatus status);

    List<Interview> findByApplicationId(Long applicationId);

    List<Interview> findByStatusInAndReminderSentFalseAndScheduledAtBetween(
            List<InterviewStatus> statuses,
            LocalDateTime from,
            LocalDateTime to
    );

    // Charge l'entretien avec sa candidature et son utilisateur en une seule requête
    @Query("select i from Interview i "
            + "join fetch i.application a "
            + "join fetch a.user "
            + "where i.id = :id")
    Optional<Interview> findWithApplicationAndUserById(@Param("id") Long id);
}