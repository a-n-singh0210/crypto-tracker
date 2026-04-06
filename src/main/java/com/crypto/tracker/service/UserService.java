package com.crypto.tracker.service;

import com.crypto.tracker.model.User;
import com.crypto.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String register(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return "Username cannot be empty";
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            return "Password must be at least 6 characters long";
        }
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return "User already exists";
        }
        userRepository.save(user);
        return "User registered successfully";
    }

    public String login(User user) {
        User existing = userRepository.findByUsername(user.getUsername());

        if (existing != null && existing.getPassword().equals(user.getPassword())) {
            return "Login successful";
        }
        return "Invalid credentials";
    }
}