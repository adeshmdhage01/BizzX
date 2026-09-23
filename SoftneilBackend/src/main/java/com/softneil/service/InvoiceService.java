package com.softneil.service;

import com.softneil.dto.InvoiceDTO;
import com.softneil.entity.InvoiceDetails;
import java.util.Map;

public interface InvoiceService {
    InvoiceDetails genereateInvoice(InvoiceDTO invoice);

    byte[] generateInvoicePDF(InvoiceDTO invoice);

    Map<String, Object> getDashboardStats(Integer userId);

    void sendInvoicePdfToEmail(InvoiceDTO invoice);

}