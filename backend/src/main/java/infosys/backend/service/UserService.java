package infosys.backend.service;

import infosys.backend.model.User;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 🔹 Read all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Read user by id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // 🔹 Read user by email
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // 🔹 Update user
    public User updateUser(Long id, User updatedUser) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setName(updatedUser.getName());
        existing.setEmail(updatedUser.getEmail());
        existing.setLocation(updatedUser.getLocation());
        existing.setRole(updatedUser.getRole());
        // ⚠️ update password only if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(updatedUser.getPassword());
        }

        return userRepository.save(existing);
    }

    // 🔹 Delete user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
