package com.email.assistant.controller;

import com.email.assistant.config.CorsConfig;
import com.email.assistant.dto.EmailRequest;
import com.email.assistant.exception.EmailGenerationException;
import com.email.assistant.service.EmailGeneratorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmailGeneratorController.class)
@Import(CorsConfig.class)
@TestPropertySource(properties = "app.cors.allowed-origins=http://localhost:5173,https://mail.google.com")
class EmailGeneratorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmailGeneratorService service;

    @Test
    void returnsGeneratedReply() throws Exception {
        when(service.generateReply(any(EmailRequest.class))).thenReturn("Thanks for reaching out!");

        mockMvc.perform(post("/api/email/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"emailContent\":\"Can we meet tomorrow?\",\"tone\":\"Friendly\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Thanks for reaching out!"));
    }

    @Test
    void rejectsBlankEmailContent() throws Exception {
        mockMvc.perform(post("/api/email/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"emailContent\":\"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("emailContent must not be empty"));
    }

    @Test
    void mapsAiFailureToBadGateway() throws Exception {
        when(service.generateReply(any(EmailRequest.class)))
                .thenThrow(new EmailGenerationException("AI down"));

        mockMvc.perform(post("/api/email/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"emailContent\":\"Hello\"}"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.message").value("AI down"));
    }

    @Test
    void allowsConfiguredOriginAndRejectsOthers() throws Exception {
        mockMvc.perform(options("/api/email/generate")
                        .header("Origin", "https://mail.google.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://mail.google.com"));

        mockMvc.perform(options("/api/email/generate")
                        .header("Origin", "https://evil.example.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
}
