package infosys.backend.controller;

import infosys.backend.dto.ProviderResponse;
import infosys.backend.model.ProviderProfile;
import infosys.backend.model.User;
import infosys.backend.repository.ProviderProfileRepository;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ProviderProfileRepository providerProfileRepository;

    // ✅ ADMIN → see all users (customers + providers)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Object>> getAllUsers() {
        List<User> users = userService.getAllUsers();

        List<Object> responses = users.stream().map(user -> {
            if (user.getRole().name().equals("PROVIDER")) {
                ProviderProfile profile = providerProfileRepository.findByUserId(user.getId());
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
            return user;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // ✅ CUSTOMER → see all providers only
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/providers")
    public ResponseEntity<List<ProviderResponse>> getAllProviders() {
        List<User> users = userService.getAllUsers().stream()
                .filter(u -> u.getRole().name().equals("PROVIDER"))
                .collect(Collectors.toList());

        List<ProviderResponse> providers = users.stream().map(user -> {
            ProviderProfile profile = providerProfileRepository.findByUserId(user.getId());
            return ProviderResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().toString())
                    .location(user.getLocation())
                    .latitude(user.getLatitude())
                    .longitude(user.getLongitude())
                    .category(profile != null ? profile.getCategory() : null)
                    .subcategory(profile != null ? profile.getSubcategory() : null)
                    .skills(profile != null ? profile.getSkills() : null)
                    .serviceArea(profile != null ? profile.getServiceArea() : null)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(providers);
    }

    // ✅ PROVIDER → see own profile
    @PreAuthorize("hasRole('PROVIDER')")
    @GetMapping("/me")
    public ResponseEntity<ProviderResponse> getMyProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId());

        return ResponseEntity.ok(
                ProviderResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().toString())
                        .location(user.getLocation())
                        .latitude(user.getLatitude())
                        .longitude(user.getLongitude())
                        .category(profile != null ? profile.getCategory() : null)
                        .subcategory(profile != null ? profile.getSubcategory() : null)
                        .skills(profile != null ? profile.getSkills() : null)
                        .serviceArea(profile != null ? profile.getServiceArea() : null)
                        .build()
        );
    }

    // ✅ ADMIN / PROVIDER → get user by ID
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER')")
    @GetMapping("/id/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        User user = userService.getUserById(id);

        // PROVIDER can only see own profile
        if (currentUser.getRole().name().equals("PROVIDER") && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        if (user.getRole().name().equals("PROVIDER")) {
            ProviderProfile profile = providerProfileRepository.findByUserId(user.getId());
            return ResponseEntity.ok(
                    ProviderResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().toString())
                            .location(user.getLocation())
                            .latitude(user.getLatitude())
                            .longitude(user.getLongitude())
                            .category(profile != null ? profile.getCategory() : null)
                            .subcategory(profile != null ? profile.getSubcategory() : null)
                            .skills(profile != null ? profile.getSkills() : null)
                            .serviceArea(profile != null ? profile.getServiceArea() : null)
                            .build()
            );
        }

        return ResponseEntity.ok(user);
    }

    // ✅ ADMIN / PROVIDER / CUSTOMER → get user by email
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        User user = userService.findByEmail(email);

        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getEmail().equals(email)) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        if (user.getRole().name().equals("PROVIDER")) {
            ProviderProfile profile = providerProfileRepository.findByUserId(user.getId());
            return ResponseEntity.ok(
                    ProviderResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().toString())
                            .location(user.getLocation())
                            .latitude(user.getLatitude())
                            .longitude(user.getLongitude())
                            .category(profile != null ? profile.getCategory() : null)
                            .subcategory(profile != null ? profile.getSubcategory() : null)
                            .skills(profile != null ? profile.getSkills() : null)
                            .serviceArea(profile != null ? profile.getServiceArea() : null)
                            .build()
            );
        }

        return ResponseEntity.ok(user);
    }

    // ✅ ADMIN / PROVIDER / CUSTOMER → update user
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();

        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        User user = userService.updateUser(id, updatedUser);
        return ResponseEntity.ok(user);
    }

    // ✅ ADMIN / PROVIDER / CUSTOMER → delete user
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();

        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
