package com.softneil.entity;
import jakarta.persistence.*;
import lombok.*;

/*
 * Product Entity
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class ProductDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer productId;

    private String productName;
    private int productPrice;
    private int sellingPrice;
    private int productQuantity;

    // Logic: Store the ID of the user who owns this product
    private Integer userId;

}