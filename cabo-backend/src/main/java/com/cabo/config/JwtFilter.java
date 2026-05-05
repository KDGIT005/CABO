package com.cabo.config;

import com.cabo.entity.User;
import com.cabo.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final FirebaseTokenVerifier firebaseTokenVerifier;

    public JwtFilter(UserRepository userRepository, FirebaseTokenVerifier firebaseTokenVerifier) {
        this.userRepository = userRepository;
        this.firebaseTokenVerifier = firebaseTokenVerifier;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                Map<String, Object> claims = firebaseTokenVerifier.verifyIdToken(token);
                String uid = firebaseTokenVerifier.getUid(claims);
                String email = firebaseTokenVerifier.getEmail(claims);

                if (uid != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    User user = userRepository.findByFirebaseUid(uid).orElseGet(() -> {
                        if (email != null) {
                            return userRepository.findByEmail(email).orElse(null);
                        }
                        return null;
                    });
                    
                    if (user != null) {
                        // Allow blocked users to access auth endpoints (to see blocked message)
                        // but block access to other endpoints
                        String path = request.getRequestURI();
                        if (user.isBlocked() && !path.startsWith("/api/auth")) {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Your account has been blocked. Contact admin.\"}");
                            return;
                        }

                        List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                        );
                        UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                // Token is invalid or expired — continue without authentication
            }
        }

        filterChain.doFilter(request, response);
    }
}
