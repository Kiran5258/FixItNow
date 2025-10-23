package infosys.backend.config;

import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@gmail.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Default admin created: admin@gmail.com / admin123");
        } else {
            System.out.println("ℹ️ Admin already exists");
        }
    }
}

package infosys.backend.config;

import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        final String adminEmail = "admin@gmail.com";
        final String defaultPassword = "admin123";

        userRepository.findByEmail(adminEmail)
                .ifPresentOrElse(
                        user -> System.out.println("ℹ️ Admin already exists: " + user.getEmail()),
                        () -> {
                            User admin = User.builder()
                                    .name("Admin")
                                    .email(adminEmail)
                                    .password(passwordEncoder.encode(defaultPassword))
                                    .role(Role.ADMIN)
                                    .build();

                            userRepository.save(admin);
                            System.out.println("✅ Default admin created:");
                            System.out.println("   Email: " + adminEmail);
                            System.out.println("   Password: " + defaultPassword);
                        }
                );
    }
}
