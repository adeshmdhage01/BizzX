package com.softneil.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.borders.SolidBorder;
//import com.itextpdf.kernel.colors.ColorConstants;
import com.softneil.dto.InvoiceDTO;
import com.softneil.dto.ProductDTO;
import com.softneil.entity.InvoiceDetails;
import com.softneil.entity.UserDetails;
import com.softneil.repository.InvoiceRepository;
import com.softneil.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;

// --- NEW IMPORTS FOR QR LOGIC ---
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.properties.HorizontalAlignment;


@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;


    public InvoiceServiceImpl(
            InvoiceRepository invoiceRepository,
            UserRepository userRepository,
            JavaMailSender mailSender) {

        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }


    @Override
    public InvoiceDetails genereateInvoice(InvoiceDTO invoice) {
        InvoiceDetails entity = new InvoiceDetails();
        entity.setCustomerName(invoice.getCustomerName());
        entity.setCustomerEmail(invoice.getCustomerEmail());
        entity.setCustomerContact(invoice.getCustomerContact());
        entity.setDate(invoice.getDate() != null ? invoice.getDate() : LocalDate.now());
        entity.setTotalAmmount(invoice.getTotalAmmount());
        entity.setDiscount(invoice.getDiscount());
        entity.setFinalAmmount(invoice.getFinalAmmount());
        entity.setUserId(invoice.getUserId());
        return invoiceRepository.save(entity);
    }

    @Override
    public byte[] generateInvoicePDF(InvoiceDTO invoice) {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        UserDetails user = userRepository.findById(invoice.getUserId()).orElse(new UserDetails());

        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            PdfFont font = PdfFontFactory.createFont(StandardFonts.TIMES_ROMAN);
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.TIMES_BOLD);
            document.setFont(font);

            // 1. Shop Details
            document.add(new Paragraph(user.getShopName() != null ? user.getShopName() : "")
                    .setFont(boldFont)
                    .setFontSize(18)
                    .setTextAlignment(TextAlignment.CENTER));

            Paragraph shopInfo = new Paragraph(
                    (user.getShopAddress() != null ? user.getShopAddress() : "") +
                            "\nOwner: " + (user.getOwnerName() != null ? user.getOwnerName() : "") +
                            " | Contact: " + (user.getContact() != null ? user.getContact() : "") +
                            " | Email: " + (user.getEmail() != null ? user.getEmail() : ""))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBorderBottom(new SolidBorder(0.5f));
            document.add(shopInfo);
            document.add(new Paragraph("\n"));

            // 2. Header Info
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
            headerTable.addCell(new Cell().add(new Paragraph()
                    .add(new Text("Customer Name: ").setFont(boldFont))
                    .add(new Text(invoice.getCustomerName()))).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));

            headerTable.addCell(new Cell().add(new Paragraph()
                            .add(new Text("Bill Id: ").setFont(boldFont))
                            .add(new Text(String.valueOf(invoice.getBillId()))))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));

            headerTable.addCell(new Cell().add(new Paragraph()
                    .add(new Text("Customer Contact: ").setFont(boldFont))
                    .add(new Text(String.valueOf(invoice.getCustomerContact())))).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));

            headerTable.addCell(new Cell().add(new Paragraph()
                            .add(new Text("Date: ").setFont(boldFont))
                            .add(new Text(invoice.getDate().toString())))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));

            headerTable.addCell(new Cell().add(new Paragraph()
                    .add(new Text("Customer Email: ").setFont(boldFont))
                    .add(new Text(invoice.getCustomerEmail()))).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));

            document.add(headerTable);

            // 3. Product Table
            document.add(new Paragraph("\n"));
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 4, 1, 2, 2})).useAllAvailableWidth();
            table.addHeaderCell(new Cell().add(new Paragraph("Sr.No.")).setFont(boldFont));
            table.addHeaderCell(new Cell().add(new Paragraph("Product name")).setFont(boldFont));
            table.addHeaderCell(new Cell().add(new Paragraph("Quantity")).setFont(boldFont));
            table.addHeaderCell(new Cell().add(new Paragraph("Rate")).setFont(boldFont));
            table.addHeaderCell(new Cell().add(new Paragraph("Total")).setFont(boldFont));

            int sr = 1;
            if (invoice.getProducts() != null) {
                for (ProductDTO p : invoice.getProducts()) {
                    table.addCell(new Cell().add(new Paragraph(String.valueOf(sr++))));
                    table.addCell(new Cell().add(new Paragraph(p.getProductName())));
                    table.addCell(new Cell().add(new Paragraph(String.valueOf(p.getProductQuantity()))));
                    table.addCell(new Cell().add(new Paragraph(String.valueOf(p.getSellingPrice()))));
                    table.addCell(new Cell().add(new Paragraph(String.valueOf(p.getSellingPrice() * p.getProductQuantity()))));
                }
            }
            document.add(table);

            // 4. Summary Table
            Table calcTable = new Table(UnitValue.createPercentArray(new float[]{3, 1})).useAllAvailableWidth();
            calcTable.addCell(new Cell().add(new Paragraph("Sub Total Amount:")).setTextAlignment(TextAlignment.RIGHT));
            calcTable.addCell(new Cell().add(new Paragraph(String.valueOf(invoice.getTotalAmmount()))));

            calcTable.addCell(new Cell().add(new Paragraph("Discount:")).setTextAlignment(TextAlignment.RIGHT));
            calcTable.addCell(new Cell().add(new Paragraph(invoice.getDiscount() + "%")));

            calcTable.addCell(new Cell().add(new Paragraph("Final Amount In Words:")).setTextAlignment(TextAlignment.RIGHT));
            calcTable.addCell(new Cell().add(new Paragraph(convertToWords(invoice.getFinalAmmount()))));

            calcTable.addCell(new Cell().add(new Paragraph("Final Amount:")).setFont(boldFont).setTextAlignment(TextAlignment.RIGHT));
            calcTable.addCell(new Cell().add(new Paragraph("Rs. " + invoice.getFinalAmmount())).setFont(boldFont));
            document.add(calcTable);

            // --- START NEW LOGIC: BANK DETAILS AND QR CODE ---
            document.add(new Paragraph("\n"));
            Table qrAndBankTable = new Table(UnitValue.createPercentArray(new float[]{2, 1})).useAllAvailableWidth();

            Cell bankInfoCell = new Cell().add(new Paragraph("BANK DETAILS")
                    .setFont(boldFont).setUnderline());
            bankInfoCell.add(new Paragraph("A/C No: " + (user.getBankAccountNumber() != null ? user.getBankAccountNumber() : "N/A")));
            bankInfoCell.add(new Paragraph("IFSC Code: " + (user.getBankIfscCode() != null ? user.getBankIfscCode() : "N/A")));
            bankInfoCell.add(new Paragraph("UPI ID: " + (user.getUpiId() != null ? user.getUpiId() : "N/A")));
            bankInfoCell.setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
            qrAndBankTable.addCell(bankInfoCell);

            if (user.getUpiId() != null && !user.getUpiId().isEmpty()) {
                try {
                    String upiUri = "upi://pay?pa=" + user.getUpiId() + "&pn=" + user.getShopName().replace(" ", "%20") + "&am=" + invoice.getFinalAmmount() + "&cu=INR";
                    QRCodeWriter qrCodeWriter = new QRCodeWriter();
                    BitMatrix bitMatrix = qrCodeWriter.encode(upiUri, BarcodeFormat.QR_CODE, 100, 100);
                    ByteArrayOutputStream qrStream = new ByteArrayOutputStream();
                    MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrStream);
                    Image qrImage = new Image(ImageDataFactory.create(qrStream.toByteArray()));

                    Cell qrCell = new Cell().add(new Paragraph("Scan to Pay").setFontSize(8).setTextAlignment(TextAlignment.CENTER))
                            .add(qrImage.setHorizontalAlignment(HorizontalAlignment.CENTER));
                    qrCell.setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
                    qrAndBankTable.addCell(qrCell);
                } catch (Exception e) {
                    qrAndBankTable.addCell(new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));
                }
            } else {
                qrAndBankTable.addCell(new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));
            }
            document.add(qrAndBankTable);
            // --- END NEW LOGIC ---

            // 5. Signature
            document.add(new Paragraph("\n"));
            Table signTable = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
            signTable.addCell(new Cell().add(new Paragraph("\nCustomer Signature")).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));
            signTable.addCell(new Cell().add(new Paragraph("\nShop Stamp & Signature")).setTextAlignment(TextAlignment.RIGHT).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));
            document.add(signTable);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return baos.toByteArray();
    }

    @Override
    public Map<String, Object> getDashboardStats(Integer userId) {
        List<InvoiceDetails> invoices = invoiceRepository.findByUserId(userId);
        LocalDate today = LocalDate.now();

        double todaySales = 0;
        double todayProfit = 0;
        double totalRevenue = 0;

        for (InvoiceDetails inv : invoices) {
            // Calculate Total Revenue (Cumulative Profit as per your requirement)
            // Assuming a margin logic: (FinalAmount * 0.2) as a placeholder for (SP - Cost)
            double margin = inv.getFinalAmmount() * 0.25;
            totalRevenue += margin;

            if (inv.getDate().equals(today)) {
                todaySales += inv.getFinalAmmount();
                todayProfit += margin;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("todaySales", Math.round(todaySales));
        stats.put("todayProfit", Math.round(todayProfit));
        stats.put("totalRevenue", Math.round(totalRevenue));
        return stats;
    }


    // FIXED: Safe number-to-words conversion (no ArrayIndexOutOfBounds)
    private String convertToWords(float amount) {

        long roundAmount = Math.round(amount);
        if (roundAmount == 0) return "Zero Rupees Only";

        String[] units = {
                "", "One", "Two", "Three", "Four", "Five", "Six",
                "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
                "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                "Seventeen", "Eighteen", "Nineteen"
        };

        String[] tens = {
                "", "", "Twenty", "Thirty", "Forty", "Fifty",
                "Sixty", "Seventy", "Eighty", "Ninety"
        };

        StringBuilder words = new StringBuilder();

        // Lakhs
        if (roundAmount >= 100000) {
            long lakh = roundAmount / 100000;
            words.append(convertToWords(lakh)).append(" Lakh ");
            roundAmount = roundAmount % 100000;
        }

        // Thousands
        if (roundAmount >= 1000) {
            long thousand = roundAmount / 1000;
            if (thousand < 20) {
                words.append(units[(int) thousand]).append(" Thousand ");
            } else {
                words.append(tens[(int) (thousand / 10)]);
                if ((thousand % 10) > 0) {
                    words.append(" ").append(units[(int) (thousand % 10)]);
                }
                words.append(" Thousand ");
            }
            roundAmount = roundAmount % 1000;
        }

        // Hundreds
        if (roundAmount >= 100) {
            long hundred = roundAmount / 100;
            words.append(units[(int) hundred]).append(" Hundred ");
            roundAmount = roundAmount % 100;
        }

        // Tens & Units
        if (roundAmount > 0) {
            if (roundAmount < 20) {
                words.append(units[(int) roundAmount]);
            } else {
                words.append(tens[(int) (roundAmount / 10)]);
                if ((roundAmount % 10) > 0) {
                    words.append(" ").append(units[(int) (roundAmount % 10)]);
                }
            }
        }

        return words.toString().trim() + " Rupees Only";
    }

    @Override
    public void sendInvoicePdfToEmail(InvoiceDTO invoice) {

        try {
            // Generate PDF
            byte[] pdfBytes = generateInvoicePDF(invoice);

            // Get Owner Email
            UserDetails user = userRepository
                    .findById(invoice.getUserId())
                    .orElse(new UserDetails());

            String ownerEmail = user.getEmail();
            String customerEmail = invoice.getCustomerEmail();

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setSubject("Invoice #" + invoice.getBillId());
            helper.setText(
                    "Dear " + invoice.getCustomerName() + ",\n\n" +
                            "Please find attached your invoice.\n\n" +
                            "Thank you for shopping with us.\n\n" +
                            user.getShopName(),
                    false
            );

            // Send to BOTH emails
            helper.setTo(new String[]{customerEmail, ownerEmail});

            helper.addAttachment(
                    "Invoice_" + invoice.getBillId() + ".pdf",
                    new ByteArrayDataSource(pdfBytes, "application/pdf")
            );

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send invoice email");
        }
    }
}