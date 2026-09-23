package com.softneil.service;

import com.softneil.dto.UserDTO;
import com.softneil.entity.UserDetails;
import com.softneil.enums.UserStatus;
import com.softneil.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setUserId(user.getUserId());
            dto.setOwnerName(user.getOwnerName());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setContact(user.getContact());
            dto.setIsActive(user.getIsActive());
            dto.setUserRole(user.getUserRole());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void updateUserStatus(Integer userId, String status) {
        UserDetails user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setIsActive(UserStatus.valueOf(status));
            userRepository.save(user);
        }
    }

    @Override
    public void deleteUser(Integer userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
        }
    }
}