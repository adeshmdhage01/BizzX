package com.softneil.repository;

import com.softneil.entity.UserDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/*
 * User database operations
 */
@Repository
public interface UserRepository extends JpaRepository<UserDetails, Integer> {

    UserDetails findByUsername(String username);
}
