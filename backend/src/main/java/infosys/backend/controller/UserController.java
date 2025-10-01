package infosys.backend.controller;

import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/providers")
    public ResponseEntity<List<User>> getAllProviders() {
        List<User> providers = userService.getAllUsers().stream()
                .filter(u -> u.getRole() == Role.PROVIDER)
                .toList();
        return ResponseEntity.ok(providers);
    }

    @PreAuthorize("hasRole('PROVIDER')")
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER')")
    @GetMapping("/id/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        if (currentUser.getRole() == Role.PROVIDER && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        if (currentUser.getRole() != Role.ADMIN && !currentUser.getEmail().equals(email)) {
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

    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        if (currentUser.getRole() != Role.ADMIN && !currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
