package com.sender.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sender.model.EmailTemplate;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CertificateServiceTest {

    @Test
    void rendersPdfCertificateAndKeepsItValid() throws Exception {
        PDDocument src = new PDDocument();
        PDPage page = new PDPage(PDRectangle.LETTER);
        src.addPage(page);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        src.save(bos);
        src.close();
        String dataUrl = "data:application/pdf;base64," + Base64.getEncoder().encodeToString(bos.toByteArray());

        EmailTemplate t = new EmailTemplate();
        t.setCertificateImage(dataUrl);
        t.setCertificateImageWidth(1000);
        t.setCertificateImageHeight(773);
        t.setCertificateTexts("[{\"variable\":\"{name}\",\"x\":0.5,\"y\":0.8,\"fontSize\":36,\"fontFamily\":\"Times New Roman, serif\",\"color\":\"#000000\",\"align\":\"center\"}]");

        byte[] out = new CertificateService(new ObjectMapper()).render(t, Map.of("name", "Alice"));

        assertNotNull(out, "render must produce bytes for PDF input");
        try (PDDocument reloaded = PDDocument.load(out)) {
            assertEquals(1, reloaded.getNumberOfPages(), "output must be a readable single-page PDF");
        }
    }
}