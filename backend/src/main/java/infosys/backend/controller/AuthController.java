package infosys.backend.controller;

import infosys.backend.dto.*;
import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.service.AuthService;
import infosys.backend.service.ServiceProviderService;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final ServiceProviderService serviceProviderService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Validate required fields
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                log.warn("Registration attempt with empty email");
                return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "Bad Request", "Email is required", "/api/auth/register")
                );
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                log.warn("Registration attempt with empty password for email: {}", request.getEmail());
                return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "Bad Request", "Password is required", "/api/auth/register")
                );
            }
            
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                log.warn("Registration attempt with empty name for email: {}", request.getEmail());
                return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "Bad Request", "Name is required", "/api/auth/register")
                );
            }
            
            if (request.getRole() == null) {
                log.warn("Registration attempt with no role specified for email: {}", request.getEmail());
                return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "Bad Request", "Role is required", "/api/auth/register")
                );
            }

            // If provider, register user first, then optionally create initial services
            if (request.getRole() == Role.PROVIDER) {
                log.info("Registering new provider: {}", request.getEmail());
                
                // 1️⃣ Register provider as a user
                User providerUser = authService.register(request);

                // 2️⃣ Optional: create initial service for provider if category is provided
                if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
                    log.info("Creating initial service for provider: {}", providerUser.getEmail());
                    
                    ServiceRequest serviceRequest = ServiceRequest.builder()
                            .providerId(providerUser.getId())
                            .category(request.getCategory())
                            .subcategory(request.getSubcategory())
                            .description(request.getSkills())   // use skills as description initially
                            .price(BigDecimal.ZERO)             // ✅ default price as BigDecimal
                            .availability("Available")          // default availability
                            .location(providerUser.getLocation())
                            .build();

                    serviceProviderService.createService(serviceRequest);
                    log.info("Initial service created successfully for provider: {}", providerUser.getEmail());
                }

            } else {
                // Register customer or admin
                log.info("Registering new {}: {}", request.getRole().name().toLowerCase(), request.getEmail());
                authService.register(request);
            }

            log.info("User registered successfully: {} as {}", request.getEmail(), request.getRole());
            return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse("Registered successfully"));
            
        } catch (RuntimeException e) {
            log.error("Registration failed for email: {} - Error: {}", request.getEmail(), e.getMessage());
            
            // Handle specific exceptions with appropriate status codes
            if (e.getMessage().contains("Email already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    new ErrorResponse(409, "Conflict", "Email already exists", "/api/auth/register")
                );
            }
            
            if (e.getMessage().contains("Provider not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse(404, "Not Found", "Provider not found", "/api/auth/register")
                );
            }
            
            if (e.getMessage().contains("Only providers can create services")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    new ErrorResponse(403, "Forbidden", "Only providers can create services", "/api/auth/register")
                );
            }
            
            // Generic error for unexpected exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse(500, "Internal Server Error", "Registration failed: " + e.getMessage(), "/api/auth/register")
            );
            
        } catch (Exception e) {
            log.error("Unexpected error during registration for email: {} - Error: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse(500, "Internal Server Error", "An unexpected error occurred", "/api/auth/register")
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Validate required fields
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                log.warn("Login attempt with empty email");
                return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "Bad Request", "Email is required", "/api/auth/login")
                );
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                log.warn("Login attempt with empty password for email: {}", request.getEmail());
                return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "Bad Request", "Password is required", "/api/auth/login")
                );
            }
            
            // Validate email format (basic validation)
            if (!request.getEmail().contains("@") || !request.getEmail().contains(".")) {
                log.warn("Login attempt with invalid email format: {}", request.getEmail());
                return ResponseEntity.badRequest().body(
                    new ErrorResponse(400, "Bad Request", "Invalid email format", "/api/auth/login")
                );
            }

            log.info("Login attempt for email: {}", request.getEmail());
            
            String token = authService.login(request);
            User user = userService.findByEmail(request.getEmail());
            String role = user.getRole().name();
            
            log.info("Login successful for email: {} with role: {}", request.getEmail(), role);
            return ResponseEntity.ok(new AuthResponse(token, role));
            
        } catch (RuntimeException e) {
            log.error("Login failed for email: {} - Error: {}", request.getEmail(), e.getMessage());
            
            // Handle specific login errors
            if (e.getMessage().contains("Invalid credentials")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ErrorResponse(401, "Unauthorized", "Invalid email or password", "/api/auth/login")
                );
            }
            
            if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse(404, "Not Found", "User not found", "/api/auth/login")
                );
            }
            
            // Generic error for unexpected exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse(500, "Internal Server Error", "Login failed: " + e.getMessage(), "/api/auth/login")
            );
            
        } catch (Exception e) {
            log.error("Unexpected error during login for email: {} - Error: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse(500, "Internal Server Error", "An unexpected error occurred", "/api/auth/login")
            );
        }
    }
}
