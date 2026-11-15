package com.applywise.backend.service;

import com.applywise.backend.dto.InterviewRequest;
import com.applywise.backend.dto.InterviewResponse;
import com.applywise.backend.entity.Application;
import com.applywise.backend.entity.Interview;
import com.applywise.backend.entity.InterviewStatus;
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

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    // CREATE
    @Transactional
    public InterviewResponse create(String email, Long applicationId, InterviewRequest request) {

        User user = findUser(email);
        Application application = findOwnedApplication(user, applicationId);

        Interview interview = new Interview();
        interview.setApplication(application);
        applyRequest(interview, request);
        interview.setStatus(request.getStatus());   // null -> SCHEDULED (@PrePersist)

        return toResponse(interviewRepository.save(interview));
    }

    // LIST par candidature
    @Transactional(readOnly = true)
    public List<InterviewResponse> getByApplication(String email, Long applicationId) {

        User user = findUser(email);
        findOwnedApplication(user, applicationId);

        return sortAndMap(interviewRepository.findByApplicationId(applicationId));
    }

    // LIST de tous mes entretiens
    @Transactional(readOnly = true)
    public List<InterviewResponse> getMyInterviews(String email) {

        User user = findUser(email);

        return sortAndMap(interviewRepository.findByApplicationUserId(user.getId()));
    }

    // UPDATE
    @Transactional
    public InterviewResponse update(String email, Long id, InterviewRequest request) {

        User user = findUser(email);
        Interview interview = findOwnedInterview(user, id);

        applyRequest(interview, request);

        if (request.getStatus() != null) {
            interview.setStatus(request.getStatus());
        }

        // Pas de save() : dirty checking
        return toResponse(interview);
    }

    // UPDATE STATUS
    @Transactional
    public InterviewResponse updateStatus(String email, Long id, InterviewStatus status) {

        User user = findUser(email);
        Interview interview = findOwnedInterview(user, id);

        interview.setStatus(status);

        return toResponse(interview);
    }

    // DELETE
    @Transactional
    public void delete(String email, Long id) {

        User user = findUser(email);
        Interview interview = findOwnedInterview(user, id);

        interviewRepository.delete(interview);
    }

    // ---------- méthodes privées ----------

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Application findOwnedApplication(User user, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Application not found");
        }
        return application;
    }

    private Interview findOwnedInterview(User user, Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getApplication().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Interview not found");
        }
        return interview;
    }

    private void applyRequest(Interview interview, InterviewRequest request) {
        interview.setTitle(request.getTitle());
        interview.setScheduledAt(request.getScheduledAt());
        interview.setLocation(request.getLocation());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setNotes(request.getNotes());
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