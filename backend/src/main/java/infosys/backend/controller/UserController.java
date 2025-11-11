package infosys.backend.controller;

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


    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
@GetMapping("/providers")
public ResponseEntity<List<User>> getAllProviders() {
    List<User> providers = userService.getAllUsers().stream()
            .filter(u -> u.getRole() == Role.PROVIDER && u.isVerified())
            .toList();
    return ResponseEntity.ok(providers);
}


    @PreAuthorize("hasRole('PROVIDER') or hasRole('CUSTOMER') or hasRole('ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/id/{id}")
@PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
public ResponseEntity<User> getUserById(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUserById(id));
}


    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getEmail().equals(email)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.updateUser(id, updatedUser));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Find user by username
@PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
@GetMapping("/username/{username}")
public ResponseEntity<User> getUserByUsername(@PathVariable String username, Authentication auth) {
    User currentUser = (User) auth.getPrincipal();

    // Allow access if admin or the user themselves
    if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getName().equals(username)) {
        return ResponseEntity.status(403).build();
    }

    return ResponseEntity.ok(userService.findByUsername(username));
}


@GetMapping("/{id}/roles")
@PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
public ResponseEntity<String> getRoles(@PathVariable Long id, Authentication auth) {
    User currentUser = (User) auth.getPrincipal();

    if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(id)) {
        return ResponseEntity.status(403).build();
    }

    User user = userService.getUserById(id);
    return ResponseEntity.ok(user.getRole().name());
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
public ResponseEntity<List<User>> getAllCustomers() {
    List<User> customers = userService.getUsersByRole("CUSTOMER");
    return ResponseEntity.ok(customers);
}




}
