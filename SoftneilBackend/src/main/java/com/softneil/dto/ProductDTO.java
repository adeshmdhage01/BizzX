package com.softneil.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Integer productId;
    private String productName;
    private Integer sellingPrice;    // Must match frontend key
    private Integer productQuantity; // Must match frontend key
}