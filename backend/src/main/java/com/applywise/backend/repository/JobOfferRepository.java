package com.applywise.backend.repository;

import com.applywise.backend.entity.JobOffer;
import com.applywise.backend.entity.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    List<JobOffer> findByTitleContainingIgnoreCase(String title);

    List<JobOffer> findByLocationContainingIgnoreCase(String location);

    List<JobOffer> findByStatus(OfferStatus status);

    List<JobOffer> findByCompanyId(Long companyId);

    // Charge l'offre avec sa company en une seule requête
    @Query("select o from JobOffer o left join fetch o.company where o.id = :id")
    Optional<JobOffer> findWithCompanyById(@Param("id") Long id);
}