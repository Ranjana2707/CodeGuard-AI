package com.codeguard.repository;

import com.codeguard.entity.ActivityLog;
import com.codeguard.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
