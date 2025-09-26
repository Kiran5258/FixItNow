package infosys.backend.controller;

import infosys.backend.dto.LoginRequest;
import infosys.backend.dto.RegisterRequest;
import infosys.backend.dto.AuthResponse;
import infosys.backend.model.User;
import infosys.backend.service.AuthService;
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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        // Use AuthResponse message constructor
        return ResponseEntity.ok(new AuthResponse("Registered successfully"));
    }

   @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
    String token = authService.login(request); // generate JWT
    User user = userService.findByEmail(request.getEmail()); // get user
    String role = user.getRole().toString(); // convert role to String

    // Only token and role, message will remain null
    AuthResponse response = new AuthResponse(token, role);
    return ResponseEntity.ok(response);
}



}
