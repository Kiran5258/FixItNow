package infosys.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import infosys.backend.security.JwtUtil;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil; // your JWT utility to validate token and get Authentication

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // Only process CONNECT frames
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7); // remove "Bearer "
                try {
                    Authentication auth = jwtUtil.getAuthentication(token); // validate token
                    accessor.setUser(auth); // attach authenticated user
                    System.out.println("✅ WebSocket user attached: " + auth.getName());
                } catch (Exception e) {
                    System.out.println("❌ Invalid JWT token: " + e.getMessage());
                }
            } else {
                System.out.println("❌ No JWT token found in STOMP CONNECT headers");
            }
        }

        // Log every frame for debugging
        Authentication auth = (Authentication) accessor.getUser();
        System.out.println("Frame=" + accessor.getCommand() + ", user=" + (auth != null ? auth.getName() : "null"));
        return message;
    }
}
