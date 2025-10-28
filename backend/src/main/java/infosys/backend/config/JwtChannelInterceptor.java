package infosys.backend.config;

import infosys.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    Authentication auth = jwtUtil.getAuthentication(token);
                    accessor.setUser(auth);
                    System.out.println("✅ CONNECT - WebSocket user attached: " + auth.getName());
                } catch (Exception e) {
                    System.out.println("❌ Invalid JWT token: " + e.getMessage());
                }
            } else {
                System.out.println("❌ No JWT token found in CONNECT headers");
            }
        } 
        else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) ||
                 StompCommand.SEND.equals(accessor.getCommand())) {

            // ✅ Reuse token header for other frames
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    Authentication auth = jwtUtil.getAuthentication(token);
                    accessor.setUser(auth);
                    System.out.println("✅ " + accessor.getCommand() + " - User restored: " + auth.getName());
                } catch (Exception e) {
                    System.out.println("❌ Token invalid in " + accessor.getCommand() + ": " + e.getMessage());
                }
            } else {
                System.out.println("⚠️ No token found in " + accessor.getCommand());
            }
        }

        Authentication auth = (Authentication) accessor.getUser();
        System.out.println("Frame=" + accessor.getCommand() + ", user=" + (auth != null ? auth.getName() : "null"));
        return message;
    }
}
