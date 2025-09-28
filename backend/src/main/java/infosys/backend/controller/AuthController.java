package infosys.backend.controller;

import infosys.backend.dto.*;
import infosys.backend.model.User;
import infosys.backend.model.ProviderProfile;
import infosys.backend.service.AuthService;
import infosys.backend.service.ProviderService;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final ProviderService providerService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (request.getRole() != null && request.getRole().name().equals("PROVIDER")) {
            // Convert RegisterRequest → ProviderRegistrationRequest
            ProviderRegistrationRequest providerRequest = ProviderRegistrationRequest.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password(request.getPassword())
                    .location(request.getLocation())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .category(request.getCategory())
                    .subcategory(request.getSubcategory())
                    .skills(request.getSkills())
                    .serviceArea(request.getServiceArea())
                    .build();

            providerService.registerProvider(providerRequest);

        } else {
            // CUSTOMER / ADMIN registration → creates User only
            authService.register(request);
        }

        // Return only a success message
        return ResponseEntity.ok(new AuthResponse("Registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Generate JWT token
        String token = authService.login(request);

        // Fetch user to get role
        User user = userService.findByEmail(request.getEmail()); // make sure AuthService has this method
        String role = user.getRole().toString();

        // Return token + role
        AuthResponse response = new AuthResponse(token, role);
        return ResponseEntity.ok(response);
    }
}
