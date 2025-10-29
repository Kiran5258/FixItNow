package infosys.backend.security;

import infosys.backend.model.User;
import infosys.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Collections;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final UserRepository userRepository; // Needed for getAuthentication

    private final String secret = "fixitnowSecretKey123fixitnowSecretKey123"; 
    private final long expiration = 3600000; // 1 hour
    private final Key key = Keys.hmacShaKeyFor(secret.getBytes());

    // ---------------- JWT Methods ---------------- //

    // Generate JWT with role
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // include role in token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract username/email
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Extract role
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Validate token
    public boolean validateToken(String token, String email) {
        return extractUsername(token).equals(email) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ---------------- WebSocket Authentication ---------------- //

    /**
     * Return a Spring Authentication object from JWT.
     * Used by JwtChannelInterceptor for WebSocket connections.
     */
   public Authentication getAuthentication(String token) {
    String email = extractUsername(token);
    if (email == null) return null;

    User user = userRepository.findByEmail(email.toLowerCase()).orElse(null);
    if (user == null) return null;

    String roleName = "ROLE_" + user.getRole().name().toUpperCase();

    return new UsernamePasswordAuthenticationToken(
        email.toLowerCase(),
        null,
        Collections.singleton(() -> roleName)
    );
}

    // Return the full User entity from JWT token
public User getUserFromToken(String token) {
    String email = extractUsername(token);
    if (email == null) return null;
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
}

}
