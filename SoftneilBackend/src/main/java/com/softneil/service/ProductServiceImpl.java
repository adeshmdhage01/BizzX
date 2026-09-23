package com.softneil.service;

import com.softneil.entity.ProductDetails;
import com.softneil.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public boolean addProduct(ProductDetails product) {
        if (product.getProductName() == null || product.getUserId() == null) {
            return false;
        }
        productRepository.save(product);
        return true;
    }

    @Override
    public boolean updateProduct(Integer productId, ProductDetails product) {
        ProductDetails existing = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existing.setProductName(product.getProductName());
        existing.setProductPrice(product.getProductPrice());
        existing.setSellingPrice(product.getSellingPrice());
        existing.setProductQuantity(product.getProductQuantity());
        // userId remains the same to maintain ownership
        productRepository.save(existing);
        return true;
    }

    @Override
    public List<ProductDetails> getAllProductsByUserId(Integer userId) {
        return productRepository.findByUserId(userId);
    }

    @Override
    public boolean deleteProduct(Integer productId) {
        productRepository.deleteById(productId);
        return true;
    }

    @Override
    public List<ProductDetails> searchByName(String productName, Integer userId) {
        return productRepository.findByProductNameContainingIgnoreCaseAndUserId(productName, userId);
    }
}