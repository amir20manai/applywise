
package com.applywise.backend.repository;

import com.applywise.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserId(Long userId);

    Optional<Resume> findByUserIdAndIsDefaultTrue(Long userId);

    long countByUserId(Long userId);
}
