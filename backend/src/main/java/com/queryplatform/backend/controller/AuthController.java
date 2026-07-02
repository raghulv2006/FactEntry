package com.queryplatform.backend.controller;

import com.queryplatform.backend.dto.*;
import com.queryplatform.backend.entity.Role;
import com.queryplatform.backend.entity.User;
import com.queryplatform.backend.security.CustomUserDetails;
import com.queryplatform.backend.security.JwtTokenProvider;
import com.queryplatform.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getUsername())
                .role(userDetails.getAuthorities().stream().findFirst().orElseThrow().getAuthority().replace("ROLE_", ""))
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody UserDto signUpRequest) {
        // Public registration always defaults to ANALYST role
        User user = userService.createUser(
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                signUpRequest.getPassword(),
                Role.ANALYST
        );
        return ResponseEntity.ok(ModelMapper.toUserDto(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getUserById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ModelMapper.toUserDto(user));
    }
}
