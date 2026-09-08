package com.sender.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sender.model.EmailTemplate;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.util.Matrix;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private static final Pattern VAR_PATTERN = Pattern.compile("\\{(\\w+)}");

    private final ObjectMapper objectMapper;

    public boolean hasCertificate(EmailTemplate template) {
        return template != null
                && template.getCertificateImage() != null
                && !template.getCertificateImage().isBlank()
                && template.getCertificateTexts() != null
                && !template.getCertificateTexts().isBlank();
    }

    public byte[] render(EmailTemplate template, Map<String, String> vars) {
        try {
            PDDocument doc = PDDocument.load(decodeBytes(template.getCertificateImage()));
            try {
                PDPage page = doc.getPage(0);
                PDRectangle box = page.getMediaBox();
                float pw = box.getWidth();
                float ph = box.getHeight();
                float designWidth = template.getCertificateImageWidth() == null ? 1000f : template.getCertificateImageWidth();

                try (PDPageContentStream cs = new PDPageContentStream(doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    for (CertText t : parseTexts(template.getCertificateTexts())) {
                        float px = (float) (t.getX() * pw);
                        float py = (float) (t.getY() * ph);
                        float size = Math.max(1, (t.getFontSize() == null ? 36 : t.getFontSize())) * pw / designWidth;
                        PDType1Font font = mapFont(t.getFontFamily());
                        String label = interpolate(t.getVariable(), vars);
                        float tw = font.getStringWidth(label) / 1000f * size;
                        String align = t.getAlign() == null ? "center" : t.getAlign();
                        float bx = switch (align) {
                            case "left" -> px;
                            case "right" -> px - tw;
                            default -> px - tw / 2;
                        };
                        float by = (ph - py) - (font.getFontDescriptor().getAscent() + font.getFontDescriptor().getDescent()) / 2000f * size;

                        cs.beginText();
                        cs.setFont(font, size);
                        Color c = parseColor(t.getColor());
                        cs.setNonStrokingColor(c.getRed(), c.getGreen(), c.getBlue());
                        cs.setTextMatrix(Matrix.getTranslateInstance(bx, by));
                        cs.showText(label);
                        cs.endText();
                    }
                }

                ByteArrayOutputStream out = new ByteArrayOutputStream();
                doc.save(out);
                return out.toByteArray();
            } finally {
                doc.close();
            }
        } catch (Exception e) {
            return null;
        }
    }

    private PDType1Font mapFont(String family) {
        if (family == null) return PDType1Font.HELVETICA;
        String f = family.toLowerCase();
        if (f.contains("courier") || f.contains("mono")) return PDType1Font.COURIER;
        if (f.contains("times") || f.contains("georgia") || (f.contains("serif") && !f.contains("sans"))) return PDType1Font.TIMES_ROMAN;
        return PDType1Font.HELVETICA;
    }

    private byte[] decodeBytes(String dataUrl) {
        String data = dataUrl.contains(",") ? dataUrl.substring(dataUrl.indexOf(",") + 1) : dataUrl;
        return Base64.getDecoder().decode(data);
    }

    private Color parseColor(String hex) {
        try {
            return Color.decode(hex);
        } catch (Exception e) {
            return Color.BLACK;
        }
    }

    private List<CertText> parseTexts(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<CertText>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String interpolate(String text, Map<String, String> vars) {
        if (text == null) return "";
        Matcher m = VAR_PATTERN.matcher(text);
        return m.matches() ? vars.getOrDefault(m.group(1), "") : "";
    }

    @Data
    public static class CertText {
        private String id;
        private String variable;
        private Double x;
        private Double y;
        private Integer fontSize;
        private String fontFamily;
        private String color;
        private String align;
    }
}