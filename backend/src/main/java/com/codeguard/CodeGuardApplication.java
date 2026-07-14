package com.codeguard;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.codeguard.entity.User;
import com.codeguard.repository.UserRepository;

@SpringBootApplication
@EnableAsync
public class CodeGuardApplication {
    public static void main(String[] args) {
        SpringApplication.run(CodeGuardApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin@codeguard.ai")
                        .password(passwordEncoder.encode("Admin@123!"))
                        .fullName("CodeGuard Admin")
                        .role(User.Role.ADMIN)
                        .active(true)
                        .build());
            }
        };
    }
}
