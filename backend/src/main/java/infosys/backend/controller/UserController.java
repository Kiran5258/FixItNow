package infosys.backend.controller;

import infosys.backend.dto.ProviderResponse;
import infosys.backend.model.ProviderProfile;
import infosys.backend.model.User;
import infosys.backend.repository.ProviderProfileRepository;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ProviderProfileRepository providerProfileRepository;

    // 🔹 Get all users (if provider, include provider fields)
    @GetMapping
    public ResponseEntity<List<Object>> getAllUsers() {
        List<User> users = userService.getAllUsers();

        List<Object> responses = users.stream().map(user -> {
            if (user.getRole().name().equals("PROVIDER")) {
                ProviderProfile profile = providerProfileRepository.findById(user.getId())
                        .orElse(null);

                if (profile != null) {
                    return ProviderResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().toString())
                            .location(user.getLocation())
                            .latitude(user.getLatitude())
                            .longitude(user.getLongitude())
                            .category(profile.getCategory())
                            .subcategory(profile.getSubcategory())
                            .skills(profile.getSkills())
                            .serviceArea(profile.getServiceArea())
                            .build();
                }
            }
            return user; // For CUSTOMER / ADMIN, return User directly
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // 🔹 Get user by ID (if provider, include provider fields)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);

        if (user.getRole().name().equals("PROVIDER")) {
            ProviderProfile profile = providerProfileRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider profile not found"));

            ProviderResponse response = ProviderResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().toString())
                    .location(user.getLocation())
                    .latitude(user.getLatitude())
                    .longitude(user.getLongitude())
                    .category(profile.getCategory())
                    .subcategory(profile.getSubcategory())
                    .skills(profile.getSkills())
                    .serviceArea(profile.getServiceArea())
                    .build();

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(user);
    }

    // 🔹 Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    // 🔹 Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return ResponseEntity.ok(userService.updateUser(id, updatedUser));
    }

    // 🔹 Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
