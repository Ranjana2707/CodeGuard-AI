package com.codeguard.service;

import com.codeguard.entity.ActivityLog;
import com.codeguard.entity.User;
import com.codeguard.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Async
    public void log(User user, String action, String details, String ipAddress) {
        try {
            ActivityLog entry = ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();
            activityLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Failed to persist activity log: {}", e.getMessage());
        }
    }
}
