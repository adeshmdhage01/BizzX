package com.softneil.controller;

import com.softneil.dto.UserDTO;
import com.softneil.service.UserAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/*
 * Handles user authentication related APIs
 * Signup and Login endpoints
 */
@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:3000"})
public class UserController {

    @Autowired
    private UserAuthService userAuthService;

    /*
     * Registers a new user
     * Returns true if signup is successful
     */
    @PostMapping("/signup")
    public Boolean signup(@RequestBody UserDTO user) {
        return userAuthService.signup(user);
    }

    /*
     * Authenticates user login
     * IMPORTANT:
     * Always return the same user object so frontend
     * can read loginStatus and loginRole
     */
    @PostMapping("/login")
    public UserDTO login(@RequestBody UserDTO user) {
        userAuthService.login(user);
        return user;
    }
    /*
     * Updates existing user details
     */
    @PutMapping("/update")
    public Boolean updateUser(@RequestBody UserDTO user) {
        return userAuthService.updateUser(user);
    }
}
