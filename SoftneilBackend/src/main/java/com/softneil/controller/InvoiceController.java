package com.softneil.controller;

import com.softneil.dto.InvoiceDTO;
import com.softneil.entity.InvoiceDetails;
import com.softneil.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/invoice")
@CrossOrigin(origins = "http://localhost:3000", exposedHeaders = "Content-Disposition")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/stats/{userId}")
    public Map<String, Object> getStats(@PathVariable Integer userId) {
        return invoiceService.getDashboardStats(userId);
    }

    @PostMapping("/generateBill")
    public InvoiceDetails generate(@RequestBody InvoiceDTO dto) {
        return invoiceService.genereateInvoice(dto);
    }

    @PostMapping("/downloadPDF")
    public ResponseEntity<byte[]> downloadInvoice(@RequestBody InvoiceDTO dto) {
        byte[] pdfBytes = invoiceService.generateInvoicePDF(dto);
        String fileName = "Invoice_" + (dto.getBillId() != null ? dto.getBillId() : "Invoice") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/send-email")
    public ResponseEntity<String> sendInvoiceEmail(@RequestBody InvoiceDTO dto) {
        invoiceService.sendInvoicePdfToEmail(dto);
        return ResponseEntity.ok("Invoice email sent successfully");
    }

}