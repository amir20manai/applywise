
package com.applywise.backend.repository;

import com.applywise.backend.entity.Interview;
import com.applywise.backend.entity.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationUserId(Long userId);

    List<Interview> findByStatus(InterviewStatus status);

    List<Interview> findByApplicationId(Long applicationId);

    List<Interview> findByStatusInAndReminderSentFalseAndScheduledAtBetween(
            List<InterviewStatus> statuses,
            LocalDateTime from,
            LocalDateTime to
    );
}
