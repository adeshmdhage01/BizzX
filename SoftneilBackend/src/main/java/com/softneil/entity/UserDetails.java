package com.softneil.entity;

import com.softneil.enums.UserRole;
import com.softneil.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String ownerName;
    private String username;
    private String password;
    private Long contact;
    private String email;
    private String shopName;
    private String shopAddress;

    @Enumerated(EnumType.STRING)
    private UserStatus isActive;

    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    private String gstNumber;
    private String shopActNumber;

    // --- NEW FIELDS ADDED ---
    private String bankAccountNumber;
    private String bankIfscCode;
    private String upiId;
}