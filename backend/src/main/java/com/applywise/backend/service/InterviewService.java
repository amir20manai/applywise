package com.applywise.backend.service;

import com.applywise.backend.dto.InterviewResponse;
import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.Interview;
import com.applywise.backend.entity.User;
import com.applywise.backend.exception.ResourceNotFoundException;
import com.applywise.backend.repository.ApplicationRepository;
import com.applywise.backend.repository.InterviewRepository;
import com.applywise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

// Le candidat consulte ses entretiens. C'est le recruteur (admin) qui les crée et les modifie.
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    // LIST par candidature
    @Transactional(readOnly = true)
    public List<InterviewResponse> getByApplication(String email, Long applicationId) {

        User user = findUser(email);

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Application not found");
        }

        return sortAndMap(interviewRepository.findByApplicationId(applicationId));
    }

    // LIST de tous mes entretiens
    @Transactional(readOnly = true)
    public List<InterviewResponse> getMyInterviews(String email) {

        User user = findUser(email);

        return sortAndMap(interviewRepository.findByApplicationUserId(user.getId()));
    }

    // ---------- méthodes privées ----------

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Tri par date (les entretiens sans date à la fin)
    private List<InterviewResponse> sortAndMap(List<Interview> interviews) {
        return interviews.stream()
                .sorted(Comparator.comparing(
                        Interview::getScheduledAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toResponse)
                .toList();
    }

    private InterviewResponse toResponse(Interview interview) {

        Application application = interview.getApplication();

        return InterviewResponse.builder()
                .id(interview.getId())
                .title(interview.getTitle())
                .scheduledAt(interview.getScheduledAt())
                .location(interview.getLocation())
                .meetingLink(interview.getMeetingLink())
                .notes(interview.getNotes())
                .status(interview.getStatus())
                .createdAt(interview.getCreatedAt())
                .applicationId(application.getId())
                .jobTitle(application.getJobTitle())
                .companyName(application.getCompanyName())
                .build();
    }
}