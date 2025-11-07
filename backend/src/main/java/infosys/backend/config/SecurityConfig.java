package infosys.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {}) // Enable CORS
            .csrf(csrf -> csrf.disable()) // Disable CSRF for APIs
            .authorizeHttpRequests(auth -> auth
                // 🔓 Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/services").permitAll()  // public service listing
                .requestMatchers("/uploads/**").permitAll()  // allow static file access
                .requestMatchers("/ws/**").permitAll()       // allow WebSocket handshake
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // preflight requests

                // 🔐 Protected endpoints
                .requestMatchers("/api/services/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/bookings/**").authenticated()
                .requestMatchers("/reviews/**").authenticated()
                .requestMatchers("/api/messages/**").authenticated()
                .requestMatchers("/api/documents/**").authenticated()
                .requestMatchers("/api/reports/**").authenticated()

                // 🧮 Admin Analytics endpoints (secured)
                .requestMatchers("/api/admin/analytics/**").authenticated()
                // 👉 If you want only admin role, you can use:
                // .requestMatchers("/api/admin/analytics/**").hasRole("ADMIN")

                // All other requests
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
