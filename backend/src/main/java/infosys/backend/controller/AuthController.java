package infosys.backend.controller;

import infosys.backend.dto.*;
import infosys.backend.model.User;
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
            authService.register(request); // CUSTOMER or ADMIN
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
