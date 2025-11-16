package infosys.backend.service;

import infosys.backend.enums.Role;
import infosys.backend.model.Booking;
import infosys.backend.model.User;
import infosys.backend.repository.AdminLogRepository;
import infosys.backend.repository.BookingRepository;
import infosys.backend.repository.ChatNotificationRepository;
import infosys.backend.repository.DocumentRepository;
import infosys.backend.repository.MessageRepository;
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
    private final ChatNotificationRepository chatNotificationRepository;
    private final MessageRepository messageRepository;
    private final AdminLogRepository adminLogRepository;

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
    System.out.println("\n========== USER DELETE START: ID = " + id + " ==========\n");

    try {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("→ Deleting data for user: " + user.getName() + " (" + user.getRole() + ")");

        // 1️⃣ Delete ALL booking reviews before bookings
        bookingRepository.findByCustomerId(id)
                .forEach(b -> reviewRepository.deleteByBookingId(b.getId()));

        bookingRepository.findByProviderId(id)
                .forEach(b -> reviewRepository.deleteByBookingId(b.getId()));

        // 2️⃣ Delete reviews by this user
        reviewRepository.deleteByCustomerId(id);
        reviewRepository.deleteByProviderId(id);

        // 3️⃣ Delete bookings (child table of services)
        bookingRepository.deleteByCustomerId(id);
        bookingRepository.deleteByProviderId(id);

        // 4️⃣ Delete chat messages
        messageRepository.deleteBySenderId(id);
        messageRepository.deleteByReceiverId(id);

        // 5️⃣ Delete notifications
        chatNotificationRepository.deleteBySenderId(id);
        chatNotificationRepository.deleteByReceiverId(id);

        // 6️⃣ Delete reports
        reportRepository.deleteByReportedById(id);
        reportRepository.deleteByTargetId(id);

        // 7️⃣ Delete documents
        documentRepository.deleteByProviderId(id);

        // 8️⃣ Delete services LAST (after bookings are removed)
        if (user.getRole() == Role.PROVIDER) {
            System.out.println("→ Deleting provider services...");
            serviceRepository.deleteByProviderId(id);
        }

        // 9️⃣ Delete admin logs
        adminLogRepository.deleteByAdminId(id);

        // 🔟 Remove user
        userRepository.deleteById(id);

        System.out.println("\n========== USER DELETE SUCCESS ==========\n");

    } catch (Exception ex) {
        System.err.println("\n========== USER DELETE FAILED ==========");
        ex.printStackTrace();
        throw ex;
    }
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
