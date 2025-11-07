package infosys.backend.controller;

import infosys.backend.dto.ChatNotificationDTO;
import infosys.backend.model.User;
import infosys.backend.service.ChatNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatNotificationController {

    private final ChatNotificationService notificationService;

    @GetMapping("/unread")
    public ResponseEntity<List<ChatNotificationDTO>> getUnreadNotifications(Principal principal) {
        User currentUser = getCurrentUser(principal);
        List<ChatNotificationDTO> notifications = notificationService.getUnreadNotifications(currentUser);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ChatNotificationDTO>> getAllNotifications(Principal principal) {
        User currentUser = getCurrentUser(principal);
        List<ChatNotificationDTO> notifications = notificationService.getAllNotifications(currentUser);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        User currentUser = getCurrentUser(principal);
        long count = notificationService.getUnreadCount(currentUser);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        notificationService.markAsRead(notificationId, currentUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Principal principal) {
        User currentUser = getCurrentUser(principal);
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-from/{senderId}")
    public ResponseEntity<Void> markAllFromSenderAsRead(
            @PathVariable Long senderId,
            Principal principal
    ) {
        User currentUser = getCurrentUser(principal);
        notificationService.markAllFromSenderAsRead(currentUser, senderId);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            return (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        }
        throw new RuntimeException("Unauthenticated user");
    }
}