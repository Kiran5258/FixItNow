package infosys.backend.controller;

import infosys.backend.dto.*;
import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.service.AuthService;
import infosys.backend.service.DocumentService;
import infosys.backend.service.ServiceProviderService;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final ServiceProviderService serviceProviderService;
    private final DocumentService documentService;

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User registeredUser = authService.register(request);

        // Create default service for providers
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

        String message = (registeredUser.getRole() == Role.PROVIDER)
                ? "Provider registered successfully. Please upload verification documents for admin review."
                : "Registered successfully.";

        AuthResponse response = new AuthResponse();
        response.setMessage(message);
        response.setUserId(registeredUser.getId());
        response.setRole(registeredUser.getRole().name());

        return ResponseEntity.ok(response);
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        User user = userService.findByEmail(request.getEmail());
        String role = user.getRole().name();

        // 🧩 Include verification info in response
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRole(role);
        response.setVerified(user.isVerified());

        // 🛑 If provider is unverified, warn instead of allowing full access
        if (user.getRole() == Role.PROVIDER && !user.isVerified()) {
            response.setMessage("Your provider account is pending admin verification.");
            return ResponseEntity.ok(response); // ✅ return 200 with warning
        }

        return ResponseEntity.ok(response);
    }

    // ✅ DOCUMENT UPLOAD
    @PostMapping("/upload-documents/{providerId}")
    public ResponseEntity<String> uploadDocuments(
            @PathVariable Long providerId,
            @RequestParam("file") MultipartFile file) {
        try {
            documentService.uploadDocument(providerId, file);
            return ResponseEntity.ok("Document uploaded successfully, pending admin review.");
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to upload document: " + e.getMessage());
        }
    }
}
