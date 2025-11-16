package infosys.backend.config;

import infosys.backend.dto.AuthUser;
import infosys.backend.model.User;
import infosys.backend.repository.UserRepository;
import infosys.backend.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                logger.warn("Invalid JWT token: " + e.getMessage());
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findByEmail(email).orElse(null);

            if (user != null && jwtUtil.validateToken(token, user.getEmail())) {

                AuthUser authUser = new AuthUser(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().name()
                );

                String roleName = "ROLE_" + user.getRole().name();

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                authUser,
                                null,
                                List.of(() -> roleName)
                        );

                SecurityContextHolder.getContext().setAuthentication(authToken);

                logger.info("Authenticated user: " + email + ", role: " + roleName);
            }
        }

        filterChain.doFilter(request, response);
    }
}
