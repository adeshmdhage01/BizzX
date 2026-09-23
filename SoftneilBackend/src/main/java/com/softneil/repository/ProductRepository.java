package com.softneil.repository;

import com.softneil.entity.ProductDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<ProductDetails, Integer> {
    ProductDetails findByProductName(String productName);
    List<ProductDetails> findByUserId(Integer userId);

    // Updated: Search only within user's own products
    List<ProductDetails> findByProductNameContainingIgnoreCaseAndUserId(String productName, Integer userId);
}