package com.softneil.controller;

import com.softneil.dto.UserDTO;
import com.softneil.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PutMapping("/user/{id}/status")
    public void updateUserStatus(@PathVariable Integer id, @RequestParam String status) {
        adminService.updateUserStatus(id, status);
    }

    @DeleteMapping("/user/{id}")
    public void deleteUser(@PathVariable Integer id) {
        adminService.deleteUser(id);
    }
}