
package com.applywise.backend.repository;

import com.applywise.backend.entity.JobOffer;
import com.applywise.backend.entity.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    List<JobOffer> findByTitleContainingIgnoreCase(String title);

    List<JobOffer> findByLocationContainingIgnoreCase(String location);

    List<JobOffer> findByStatus(OfferStatus status);

    List<JobOffer> findByCompanyId(Long companyId);
}
