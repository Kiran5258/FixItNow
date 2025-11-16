package infosys.backend.controller;

import infosys.backend.dto.AuthUser;
import infosys.backend.dto.UserDTO;
import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.repository.UserRepository;
import infosys.backend.service.PresenceService;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PresenceService presenceService;

    // Convert User → UserDTO
    private UserDTO toDTO(User u) {
        return new UserDTO(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getRole().name(),
                u.getLocation(),
                u.isVerified()
        );
    }

    // Helper to get logged-in User from AuthUser principal
    private User getLoggedUser(Authentication auth) {
        AuthUser au = (AuthUser) auth.getPrincipal();
        return userRepository.findById(au.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers().stream().map(this::toDTO).toList()
        );
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/providers")
    public ResponseEntity<List<UserDTO>> getAllProviders() {
        List<UserDTO> providers = userService.getAllUsers().stream()
                .filter(u -> u.getRole() == Role.PROVIDER && u.isVerified())
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(providers);
    }

    // ❤️ FIXED -- NO MORE CASTING ERROR
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(Authentication auth) {
        User loggedUser = getLoggedUser(auth);
        return ResponseEntity.ok(toDTO(loggedUser));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/id/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(toDTO(userService.getUserById(id)));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email, Authentication auth) {

        User currentUser = getLoggedUser(auth);

        if (!currentUser.getRole().name().equals("ADMIN") &&
                !currentUser.getEmail().equals(email)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(toDTO(userService.findByEmail(email)));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                              @RequestBody User updatedUser,
                                              Authentication auth) {

        User currentUser = getLoggedUser(auth);

        if (!currentUser.getRole().name().equals("ADMIN") &&
                !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
            toDTO(userService.updateUser(id, updatedUser))
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, Authentication auth) {

        AuthUser current = (AuthUser) auth.getPrincipal();

        if (!current.getRole().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username, Authentication auth) {

        User currentUser = getLoggedUser(auth);

        if (!currentUser.getRole().name().equals("ADMIN") &&
                !currentUser.getName().equals(username)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(toDTO(userService.findByUsername(username)));
    }

    @GetMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    public ResponseEntity<String> getRoles(@PathVariable Long id, Authentication auth) {
        User currentUser = getLoggedUser(auth);

        if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(userService.getRole(id));
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable Long id) {
        boolean online = presenceService.isUserOnline(id);
        return ResponseEntity.ok(Map.of("online", online));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/verify")
    public ResponseEntity<String> verifyProvider(@PathVariable Long id) {
        User user = userService.getUserById(id);

        if (user.getRole() != Role.PROVIDER) {
            return ResponseEntity.badRequest().body("User is not a provider");
        }

        user.setVerified(true);
        userRepository.save(user);

        return ResponseEntity.ok("Provider verified successfully");
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDTO>> getAllCustomers() {
        return ResponseEntity.ok(
                userService.getUsersByRole("CUSTOMER").stream()
                        .map(this::toDTO)
                        .toList()
        );
    }
}
