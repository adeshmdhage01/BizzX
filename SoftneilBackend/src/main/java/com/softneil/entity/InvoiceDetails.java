package com.softneil.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "invoice")
public class InvoiceDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer billId;

    private String customerName;
    private String customerEmail;
    private Long customerContact;
    private LocalDate date;

    private Integer totalAmmount;
    private Integer discount;
    private Float finalAmmount;

    // Logic: Link invoice to user without FK
    private Integer userId;
}