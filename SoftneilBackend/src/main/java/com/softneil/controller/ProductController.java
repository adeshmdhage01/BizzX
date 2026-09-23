package com.softneil.controller;

import com.softneil.entity.ProductDetails;
import com.softneil.service.ProductService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = {"http://localhost:3000"})
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/add")
    public boolean addProduct(@RequestBody ProductDetails product) {
        return productService.addProduct(product);
    }

    /*
     * Fetch products only for a specific user
     */
    @GetMapping("/get-all/{userId}")
    public List<ProductDetails> getAllProducts(@PathVariable Integer userId) {
        return productService.getAllProductsByUserId(userId);
    }

    @PutMapping("/update")
    public boolean updateProduct(@RequestBody ProductDetails product) {
        if (product.getProductId() == null) return false;
        return productService.updateProduct(product.getProductId(), product);
    }

    @DeleteMapping("/delete")
    public boolean deleteProduct(@RequestBody Map<String, Integer> request) {
        Integer productId = request.get("productId");
        return productId != null && productService.deleteProduct(productId);
    }

    @PostMapping("/search")
    public List<ProductDetails> searchProduct(@RequestBody Map<String, Object> req) {
        String productName = (String) req.get("productName");
        Integer userId = (Integer) req.get("userId");
        return (productName == null || userId == null) ? List.of() : productService.searchByName(productName, userId);
    }
}