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

        // 1️⃣ Create user
        User registeredUser = authService.register(request);

        // 2️⃣ If provider, create service
        if (registeredUser.getRole() == Role.PROVIDER) {
            ServiceRequest serviceRequest = ServiceRequest.builder()
                    .category(request.getCategory())
                    .subcategory(request.getSubcategory())
                    .description(request.getDescription())
                    .price(request.getPrice() != null ? BigDecimal.valueOf(request.getPrice()) : BigDecimal.ZERO)
                    .availability(request.getAvailability() != null ? request.getAvailability() : "Available")
                    .location(registeredUser.getLocation())
                    .build();

            serviceProviderService.createService(serviceRequest, registeredUser.getEmail());
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
