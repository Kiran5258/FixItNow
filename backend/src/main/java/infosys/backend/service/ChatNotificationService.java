package infosys.backend.service;

import infosys.backend.dto.ChatNotificationDTO;
import infosys.backend.model.ChatNotification;
import infosys.backend.model.User;
import infosys.backend.repository.ChatNotificationRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatNotificationService {

    private final ChatNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatNotification createNotification(User sender, User receiver, String messageContent, LocalDateTime sentAt) {
        // Check for duplicate notification within 5 seconds window
        LocalDateTime startTime = sentAt.minusSeconds(5);
        LocalDateTime endTime = sentAt.plusSeconds(5);
        
        var existingNotification = notificationRepository.findDuplicate(
            sender, receiver, messageContent, startTime, endTime
        );
        
        if (existingNotification.isPresent()) {
            System.out.println("⚠ Duplicate notification detected, skipping creation");
            return existingNotification.get();
        }
        
        ChatNotification notification = ChatNotification.builder()
                .sender(sender)
                .receiver(receiver)
                .messageContent(messageContent)
                .sentAt(sentAt)
                .isRead(false)
                .build();

        ChatNotification saved = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        ChatNotificationDTO dto = convertToDTO(saved);
        messagingTemplate.convertAndSendToUser(
            receiver.getEmail().toLowerCase(),
            "/queue/notifications",
            dto
        );
        
        System.out.println("🔔 Notification sent to " + receiver.getEmail() + " from " + sender.getName());
        
        return saved;
    }

    public List<ChatNotificationDTO> getUnreadNotifications(User receiver) {
        List<ChatNotification> notifications = notificationRepository
                .findByReceiverAndIsReadFalseOrderBySentAtDesc(receiver);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ChatNotificationDTO> getAllNotifications(User receiver) {
        List<ChatNotification> notifications = notificationRepository
                .findByReceiverOrderBySentAtDesc(receiver);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User receiver) {
        return notificationRepository.countByReceiverAndIsReadFalse(receiver);
    }

    @Transactional
    public void markAsRead(Long notificationId, User receiver) {
        ChatNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("Unauthorized to mark this notification as read");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User receiver) {
        List<ChatNotification> unreadNotifications = notificationRepository
                .findByReceiverAndIsReadFalseOrderBySentAtDesc(receiver);
        
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void markAllFromSenderAsRead(User receiver, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        List<ChatNotification> notifications = notificationRepository
                .findByReceiverAndSenderOrderBySentAtDesc(receiver, sender);
        
        notifications.stream()
                .filter(n -> !n.getIsRead())
                .forEach(n -> n.setIsRead(true));
        
        notificationRepository.saveAll(notifications);
    }

    private ChatNotificationDTO convertToDTO(ChatNotification notification) {
        return ChatNotificationDTO.builder()
                .id(notification.getId())
                .senderId(notification.getSender().getId())
                .senderName(notification.getSender().getName())
                .receiverId(notification.getReceiver().getId())
                .receiverName(notification.getReceiver().getName())
                .messageContent(notification.getMessageContent())
                .sentAt(notification.getSentAt())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}