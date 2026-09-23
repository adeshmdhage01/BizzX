package com.softneil.service;

import com.softneil.dto.UserDTO;

/*
 * User authentication operations
 */
public interface UserAuthService {

    Boolean signup(UserDTO user);

    Boolean login(UserDTO user);

    Boolean updateUser(UserDTO user);
}