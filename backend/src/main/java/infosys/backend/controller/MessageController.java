package infosys.backend.controller;

import infosys.backend.dto.MessageDTO;
import infosys.backend.model.Message;
import infosys.backend.model.User;
import infosys.backend.service.MessageService;
import infosys.backend.service.ChatNotificationService;
import infosys.backend.repository.UserRepository;
import infosys.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;
    private final ChatNotificationService notificationService;

    // ---------------- REST API ---------------- //

    @PostMapping
public ResponseEntity<MessageDTO> sendMessage(
        @RequestBody Message message,
        Principal principal
) {
   User sender;
if (principal instanceof UsernamePasswordAuthenticationToken) {
    sender = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
} else {
    throw new RuntimeException("Unauthenticated user attempted to send message");
}
message.setSender(sender);


    User receiver = userRepository.findById(message.getReceiver().getId())
            .orElseThrow(() -> new RuntimeException("Receiver not found"));
    message.setReceiver(receiver);

    Message saved = messageService.saveMessage(message);

    return ResponseEntity.ok(convertToDTO(saved));
}

    @GetMapping("/between/{userId}")
public ResponseEntity<List<MessageDTO>> getMessagesWithUser(
        @PathVariable Long userId,
        Principal principal
) {
    User currentUser;
    if (principal instanceof UsernamePasswordAuthenticationToken) {
        currentUser = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
    } else {
        throw new RuntimeException("Unauthenticated user");
    }

    User otherUser = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Other user not found"));

    List<Message> messages = messageService.getMessagesBetweenUsers(currentUser, otherUser);
    List<MessageDTO> dtos = messages.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

    return ResponseEntity.ok(dtos);
}


    // ---------------- WebSocket ---------------- //

   @MessageMapping("/chat.sendMessage")
public void sendMessageWebSocket(
        @Payload MessageDTO messageDTO,
        SimpMessageHeaderAccessor headerAccessor
) {
    String token = headerAccessor.getFirstNativeHeader("Authorization");
    if (token == null || !token.startsWith("Bearer ")) {
        System.out.println("❌ Missing or invalid token, cannot send message");
        return;
    }

    token = token.substring(7);

    // ✅ Get user email from token, then fetch actual User from DB
    String email;
    try {
        email = jwtUtil.extractUsername(token); // change to your method that extracts username/email
    } catch (Exception e) {
        System.out.println("❌ Invalid token, cannot authenticate user: " + e.getMessage());
        return;
    }

    User sender = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Sender not found with email: " + email));

    if (messageDTO.getReceiverId() == null) {
        System.out.println("❌ Receiver ID is null, cannot send message");
        return;
    }

    User receiver = userRepository.findById(messageDTO.getReceiverId())
            .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + messageDTO.getReceiverId()));

    Message message = Message.builder()
            .sender(sender)
            .receiver(receiver)
            .content(messageDTO.getContent())
            .sentAt(LocalDateTime.now())
            .build();

    Message saved = messageService.saveMessage(message);
    MessageDTO dto = convertToDTO(saved);

    // ✅ Broadcast to both users (real-time)
   System.out.println("📤 Sending WebSocket message to user: " + receiver.getEmail());
messagingTemplate.convertAndSendToUser(receiver.getEmail().toLowerCase(), "/queue/messages", dto);

    messagingTemplate.convertAndSendToUser(sender.getEmail().toLowerCase(), "/queue/messages", dto);

    // 🔔 Create notification for receiver
    notificationService.createNotification(sender, receiver, messageDTO.getContent(), saved.getSentAt());

    System.out.println("✅ Message saved and sent via WebSocket: " + dto);
    System.out.println("📨 WebSocket header user: " + headerAccessor.getUser());
System.out.println("📨 Sending to user: " + receiver.getEmail());

}



    // ---------------- Utility Methods ---------------- //

    private MessageDTO convertToDTO(Message message) {
        return new MessageDTO(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getReceiver().getId(),
                message.getReceiver().getName(),
                message.getContent(),
                message.getSentAt()
        );
    }
}