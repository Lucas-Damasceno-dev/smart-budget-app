package com.financeflow.config;

import com.financeflow.entity.User;
import com.financeflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!test")
    public CommandLineRunner initDemoUser() {
        return args -> {
            String demoEmail = "demo@financeflow.com";
            String demoPassword = "Demo@123";
            
            userRepository.findByEmail(demoEmail).ifPresent(user -> {
                String encodedPassword = passwordEncoder.encode(demoPassword);
                user.setPassword(encodedPassword);
                if (user.getRole() == null) user.setRole(User.Role.USER);
                if (user.getProfileType() == null) user.setProfileType(User.ProfileType.INDIVIDUAL);
                user.setEnabled(true);
                userRepository.save(user);
                log.info("Demo user password and credentials initialized successfully");
            });
        };
    }
}
