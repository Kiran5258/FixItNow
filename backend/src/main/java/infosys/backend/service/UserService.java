package infosys.backend.service;

import infosys.backend.enums.Role;
import infosys.backend.model.User;
import infosys.backend.repository.BookingRepository;
import infosys.backend.repository.DocumentRepository;
import infosys.backend.repository.ReportRepository;
import infosys.backend.repository.ReviewRepository;
import infosys.backend.repository.ServiceRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ServiceRepository serviceRepository;
    private final DocumentRepository documentRepository;
    private final ReportRepository reportRepository;

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
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(updatedUser.getPassword());
        }

        return userRepository.save(existing);
    }

    @Transactional
public void deleteUser(Long id) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // 1️⃣ Delete related entities
    bookingRepository.deleteByCustomerId(id);
    bookingRepository.deleteByProviderId(id);
    reviewRepository.deleteByCustomerId(id);
    reviewRepository.deleteByProviderId(id);
    serviceRepository.deleteByProviderId(id);
    documentRepository.deleteByProviderId(id);
    reportRepository.deleteByReportedById(id);
    reportRepository.deleteByTargetId(id);

    // 2️⃣ Delete user
    userRepository.deleteById(id);
}

    public User findByUsername(String username) {
    return userRepository.findByName(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
}

public String getRole(Long id) {
        User user = getUserById(id);
        return user.getRole().name();
    }
     public List<User> getUsersByRole(String role) {
    try {
        Role roleEnum = Role.valueOf(role.toUpperCase()); // Convert string to enum
        return userRepository.findByRole(roleEnum);
    } catch (IllegalArgumentException e) {
        throw new RuntimeException("Invalid role: " + role);
    }
}

}

