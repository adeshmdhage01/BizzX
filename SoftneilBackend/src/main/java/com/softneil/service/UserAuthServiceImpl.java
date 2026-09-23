package com.softneil.service;

import com.softneil.dto.UserDTO;
import com.softneil.entity.UserDetails;
import com.softneil.enums.UserRole;
import com.softneil.enums.UserStatus;
import com.softneil.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserAuthServiceImpl implements UserAuthService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public Boolean signup(UserDTO user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return false;
        }

        UserDetails userDetails = new UserDetails();
        userDetails.setUsername(user.getUsername());
        userDetails.setPassword(user.getPassword());
        userDetails.setOwnerName(user.getOwnerName());
        userDetails.setContact(user.getContact());
        userDetails.setEmail(user.getEmail());
        userDetails.setShopName(user.getShopName());
        userDetails.setShopAddress(user.getShopAddress());
        userDetails.setGstNumber(user.getGstNumber());
        userDetails.setShopActNumber(user.getShopActNumber());

        // --- NEW LOGIC ADDED ---
        userDetails.setBankAccountNumber(user.getBankAccountNumber());
        userDetails.setBankIfscCode(user.getBankIfscCode());
        userDetails.setUpiId(user.getUpiId());

        userDetails.setIsActive(UserStatus.I);
        userDetails.setUserRole(UserRole.USER);

        userRepository.save(userDetails);
        return true;
    }

    @Override
    public Boolean login(UserDTO user) {
        UserDetails existingUser = userRepository.findByUsername(user.getUsername());

        if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
            if (existingUser.getIsActive() == UserStatus.I) {
                user.setLoginStatus("INACTIVE");
                return false;
            }

            user.setUserId(existingUser.getUserId());
            user.setLoginRole(existingUser.getUserRole());
            user.setLoginStatus("SUCCESS");

            user.setOwnerName(existingUser.getOwnerName());
            user.setContact(existingUser.getContact());
            user.setEmail(existingUser.getEmail());
            user.setShopName(existingUser.getShopName());
            user.setShopAddress(existingUser.getShopAddress());
            user.setGstNumber(existingUser.getGstNumber());
            user.setShopActNumber(existingUser.getShopActNumber());

            // --- NEW LOGIC ADDED ---
            user.setBankAccountNumber(existingUser.getBankAccountNumber());
            user.setBankIfscCode(existingUser.getBankIfscCode());
            user.setUpiId(existingUser.getUpiId());

            return true;
        }
        user.setLoginStatus("INVALID");
        return false;
    }

    @Override
    public Boolean updateUser(UserDTO user) {
        if (user.getUserId() == null) return false;

        java.util.Optional<UserDetails> userData = userRepository.findById(user.getUserId());
        if (userData.isPresent()) {
            UserDetails existingUser = userData.get();
            existingUser.setOwnerName(user.getOwnerName());
            existingUser.setContact(user.getContact());
            existingUser.setEmail(user.getEmail());
            existingUser.setPassword(user.getPassword());
            existingUser.setShopName(user.getShopName());
            existingUser.setShopAddress(user.getShopAddress());
            existingUser.setGstNumber(user.getGstNumber());
            existingUser.setShopActNumber(user.getShopActNumber());

            // --- NEW LOGIC ADDED ---
            existingUser.setBankAccountNumber(user.getBankAccountNumber());
            existingUser.setBankIfscCode(user.getBankIfscCode());
            existingUser.setUpiId(user.getUpiId());

            userRepository.save(existingUser);
            return true;
        }
        return false;
    }
}