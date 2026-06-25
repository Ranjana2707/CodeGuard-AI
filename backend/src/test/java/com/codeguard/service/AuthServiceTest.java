package com.codeguard.service;

import com.codeguard.dto.LoginRequest;
import com.codeguard.dto.RegisterRequest;
import com.codeguard.dto.AuthResponse;
import com.codeguard.entity.User;
import com.codeguard.repository.UserRepository;
import com.codeguard.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtils jwtUtils;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserDetailsService userDetailsService;

    @InjectMocks private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .password("encoded_password")
            .role(User.Role.USER)
            .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(testUser);
        UserDetails ud = new org.springframework.security.core.userdetails.User(
            "newuser", "encoded", List.of());
        when(userDetailsService.loadUserByUsername(any())).thenReturn(ud);
        when(jwtUtils.generateToken(any())).thenReturn("access_token");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refresh_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_UsernameAlreadyTaken_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        when(authenticationManager.authenticate(any())).thenReturn(
            new UsernamePasswordAuthenticationToken("testuser", "password123"));
        UserDetails ud = new org.springframework.security.core.userdetails.User(
            "testuser", "encoded", List.of());
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(ud);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtUtils.generateToken(any())).thenReturn("access_token");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refresh_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("Bearer", response.getTokenType());
        verify(authenticationManager).authenticate(any());
    }
}
