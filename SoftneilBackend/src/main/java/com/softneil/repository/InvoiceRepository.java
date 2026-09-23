package com.softneil.repository;

import com.softneil.entity.InvoiceDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<InvoiceDetails, Integer> {
    List<InvoiceDetails> findByUserId(Integer userId);
}