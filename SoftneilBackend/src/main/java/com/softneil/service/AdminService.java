package com.softneil.service;

import com.softneil.dto.UserDTO;
import java.util.List;

public interface AdminService {
    List<UserDTO> getAllUsers();
    void updateUserStatus(Integer userId, String status);
    void deleteUser(Integer userId);
}