package com.softneil.dto;

import com.softneil.enums.UserRole;
import com.softneil.enums.UserStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Integer userId;
    private String ownerName;
    private String username;
    private String password;
    private Long contact;
    private String email;
    private String shopName;
    private String shopAddress;

    private UserStatus isActive;
    private UserRole userRole;

    private String gstNumber;
    private String shopActNumber;

    // --- NEW LOGIC ADDED ---
    private String bankAccountNumber;
    private String bankIfscCode;
    private String upiId;

    private String loginStatus;
    private UserRole loginRole;
}