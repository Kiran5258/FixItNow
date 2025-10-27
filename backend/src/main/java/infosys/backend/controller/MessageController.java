package infosys.backend.controller;

import infosys.backend.dto.MessageDTO;
import infosys.backend.model.Message;
import infosys.backend.model.User;
import infosys.backend.service.MessageService;
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
    // Extract JWT from STOMP CONNECT/SEND headers
    String token = headerAccessor.getFirstNativeHeader("Authorization");
    if (token == null || !token.startsWith("Bearer ")) {
        System.out.println("❌ Missing or invalid token, cannot send message");
        return;
    }
    token = token.substring(7);

    // Get authenticated user from JWT
    User sender;
    try {
        sender = jwtUtil.getUserFromToken(token); // implement this method in your JwtUtil
    } catch (Exception e) {
        System.out.println("❌ Invalid token, cannot authenticate user: " + e.getMessage());
        return;
    }

    // Validate and fetch receiver
    if (messageDTO.getReceiverId() == null) {
        System.out.println("❌ Receiver ID is null, cannot send message");
        return;
    }
    User receiver = userRepository.findById(messageDTO.getReceiverId())
            .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + messageDTO.getReceiverId()));

    // Build message entity
    Message message = Message.builder()
            .sender(sender)
            .receiver(receiver)
            .content(messageDTO.getContent())
            .sentAt(LocalDateTime.now())
            .build();

    // Save message to database
    Message saved = messageService.saveMessage(message);

    // Convert saved message to DTO
    MessageDTO dto = convertToDTO(saved);

    // Send via STOMP to sender and receiver
    messagingTemplate.convertAndSendToUser(receiver.getEmail(), "/queue/messages", dto);
    messagingTemplate.convertAndSendToUser(sender.getEmail(), "/queue/messages", dto);

    System.out.println("✅ Message saved and sent via WebSocket: " + dto);
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
