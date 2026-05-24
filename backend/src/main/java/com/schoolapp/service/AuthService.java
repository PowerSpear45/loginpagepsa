package com.schoolapp.service;

import com.schoolapp.dto.LoginRequest;
import com.schoolapp.dto.LoginResponse;
import com.schoolapp.entity.UserAccount;
import com.schoolapp.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserAccountRepository userRepository;

    public AuthService(UserAccountRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {

        UserAccount user = userRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (user == null) {
            return new LoginResponse(false, "Invalid username", null);
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            return new LoginResponse(false, "Account is inactive", null);
        }

        if (!user.getRole().equalsIgnoreCase(request.getRole())) {
            return new LoginResponse(false, "Invalid role selected", null);
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return new LoginResponse(false, "Invalid password", null);
        }

        return new LoginResponse(true, "Login successful", user.getRole());
    }
}
