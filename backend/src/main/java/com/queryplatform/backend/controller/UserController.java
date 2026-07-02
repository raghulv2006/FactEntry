package com.queryplatform.backend.controller;

import com.queryplatform.backend.dto.ModelMapper;
import com.queryplatform.backend.dto.UserDto;
import com.queryplatform.backend.entity.Role;
import com.queryplatform.backend.entity.User;
import com.queryplatform.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> list = userService.getAllUsers().stream()
                .map(ModelMapper::toUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto dto) {
        Role role = Role.valueOf(dto.getRole().toUpperCase());
        User user = userService.createUser(dto.getName(), dto.getEmail(), dto.getPassword(), role);
        return ResponseEntity.ok(ModelMapper.toUserDto(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto dto) {
        Role role = dto.getRole() != null ? Role.valueOf(dto.getRole().toUpperCase()) : null;
        User user = userService.updateUser(id, dto.getName(), dto.getEmail(), dto.getPassword(), role);
        return ResponseEntity.ok(ModelMapper.toUserDto(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
