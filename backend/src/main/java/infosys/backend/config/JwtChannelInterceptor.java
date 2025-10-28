package infosys.backend.config;

import infosys.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())
                || StompCommand.SUBSCRIBE.equals(accessor.getCommand())
                || StompCommand.SEND.equals(accessor.getCommand())) {

            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);

                try {
                    // ✅ Extract the email (username) from JWT
                    String email = jwtUtil.extractUsername(token);

                    // ✅ Normalize for consistency
                    email = email.trim().toLowerCase();

                    // ✅ Create Authentication object with email as principal
                    Authentication auth =
                            new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());

                    accessor.setUser(auth);
                    System.out.println("✅ WebSocket user attached: " + email);

                } catch (Exception e) {
                    System.out.println("❌ Invalid JWT token: " + e.getMessage());
                }
            } else {
                System.out.println("⚠️ No JWT token found in " + accessor.getCommand() + " headers");
            }
        }

        Authentication auth = (Authentication) accessor.getUser();
        System.out.println("Frame=" + accessor.getCommand()
                + ", user=" + (auth != null ? auth.getName() : "null"));

        return message;
    }
}
