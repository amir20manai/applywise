package com.applywise.backend.repository;

import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.ApplicationStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    // ---------- Administrateur: seulement les candidatures envoyées à une offre de la plateforme ----------

    @Query("""
            select a from Application a
            join fetch a.user
            left join fetch a.resume
            where a.jobOffer is not null
            order by a.appliedAt desc
            """)
    List<Application> findAllForAdmin();

    @Query("""
            select a from Application a
            join fetch a.user
            left join fetch a.resume
            where a.jobOffer is not null and a.status = :status
            order by a.appliedAt desc
            """)
    List<Application> findAllForAdminByStatus(@Param("status") ApplicationStatus status);

    long countByJobOfferIsNotNull();

    long countByJobOfferIsNotNullAndStatus(ApplicationStatus status);

    long countByJobOfferIsNotNullAndAppliedAtAfter(LocalDateTime from);

    // Offres les plus postulées: [id, titre, nom de la company, nombre de candidatures]
    @Query("""
            select o.id, o.title, c.name, count(a)
            from Application a
            join a.jobOffer o
            left join o.company c
            group by o.id, o.title, c.name
            order by count(a) desc, o.title asc
            """)
    List<Object[]> findTopOffers(Pageable pageable);
}