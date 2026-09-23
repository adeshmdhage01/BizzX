package com.softneil.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private Integer billId;
    private String customerName;
    private String customerEmail;
    private Long customerContact;
    private LocalDate date;
    private List<ProductDTO> products;
    private Integer discount;
    private Integer totalAmmount; // Keeping your spelling
    private Float finalAmmount;   // Keeping your spelling
    private Integer userId;
}