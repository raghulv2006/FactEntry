package com.queryplatform.backend.config;

import com.queryplatform.backend.entity.Role;
import com.queryplatform.backend.entity.User;
import com.queryplatform.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            String defaultPassword = passwordEncoder.encode("password");
            
            // Seed default users
            User analyst = User.builder()
                    .name("Default Analyst")
                    .email("analyst@example.com")
                    .passwordHash(defaultPassword)
                    .role(Role.ANALYST)
                    .build();

            User sme = User.builder()
                    .name("Default SME")
                    .email("sme@example.com")
                    .passwordHash(defaultPassword)
                    .role(Role.SME)
                    .build();

            User admin = User.builder()
                    .name("Default Admin")
                    .email("admin@example.com")
                    .passwordHash(defaultPassword)
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(analyst);
            userRepository.save(sme);
            userRepository.save(admin);
            
            System.out.println("Default users seeded successfully in H2 database.");
        }
    }
}
