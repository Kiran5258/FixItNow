package infosys.backend.controller;

import infosys.backend.dto.*;
import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.service.AuthService;
import infosys.backend.service.ServiceProviderService;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final ServiceProviderService serviceProviderService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {

        // If provider, register user first, then optionally create initial services
        if (request.getRole() != null && request.getRole() == Role.PROVIDER) {
            // 1️⃣ Register provider as a user
            User providerUser = authService.register(request);

            // 2️⃣ Optional: create initial service for provider if category is provided
            if (request.getCategory() != null) {
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
            }

        } else {
            // Register customer or admin
            authService.register(request);
        }

        return ResponseEntity.ok(new AuthResponse("Registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        User user = userService.findByEmail(request.getEmail());
        String role = user.getRole().name();
        return ResponseEntity.ok(new AuthResponse(token, role));
    }
}
