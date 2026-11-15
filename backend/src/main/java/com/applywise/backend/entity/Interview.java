
package com.applywise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private LocalDateTime scheduledAt;

    private String location;

    private String meetingLink;

    @Column(length = 2000)
    private String notes;

    @Enumerated(EnumType.STRING)
    private InterviewStatus status;

    private LocalDateTime createdAt;

    @Builder.Default
    private boolean reminderSent = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = InterviewStatus.SCHEDULED;
        }
    }
}
