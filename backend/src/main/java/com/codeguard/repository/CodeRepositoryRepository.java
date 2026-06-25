package com.codeguard.repository;

import com.codeguard.entity.CodeRepository;
import com.codeguard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeRepositoryRepository extends JpaRepository<CodeRepository, Long> {

    List<CodeRepository> findByUser(User user);

    List<CodeRepository> findByUserAndActive(User user, boolean active);

    long countByUser(User user);
}
