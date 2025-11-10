package infosys.backend.config;

import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${ADMIN_EMAIL}")
    private String adminEmail;
    
    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Default admin created: " + adminEmail);
        } else {
            System.out.println("ℹ️ Admin already exists");
        }
    }
}
