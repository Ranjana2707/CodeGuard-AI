package com.codeguard.service;

import com.codeguard.dto.AuthResponse;
import com.codeguard.dto.LoginRequest;
import com.codeguard.dto.RefreshTokenRequest;
import com.codeguard.dto.RegisterRequest;
import com.codeguard.dto.UserDto;
import com.codeguard.entity.User;
import com.codeguard.exception.BadRequestException;
import com.codeguard.exception.ResourceNotFoundException;
import com.codeguard.repository.UserRepository;
import com.codeguard.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.USER)
                .build();

        user = userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

        return AuthResponse.builder()
                .accessToken(jwtUtils.generateToken(userDetails))
                .refreshToken(jwtUtils.generateRefreshToken(userDetails))
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .accessToken(jwtUtils.generateToken(userDetails))
                .refreshToken(jwtUtils.generateRefreshToken(userDetails))
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = jwtUtils.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!jwtUtils.validateToken(refreshToken, userDetails)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        return AuthResponse.builder()
                .accessToken(jwtUtils.generateToken(userDetails))
                .refreshToken(jwtUtils.generateRefreshToken(userDetails))
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserDto(user);
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
