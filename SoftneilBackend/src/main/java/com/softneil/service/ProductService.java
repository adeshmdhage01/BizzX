package com.softneil.service;

import com.softneil.entity.ProductDetails;
import java.util.List;

public interface ProductService {
    boolean addProduct(ProductDetails product);
    boolean updateProduct(Integer productId, ProductDetails product);
    List<ProductDetails> getAllProductsByUserId(Integer userId); // Updated
    boolean deleteProduct(Integer productId);
    List<ProductDetails> searchByName(String productName, Integer userId);
}