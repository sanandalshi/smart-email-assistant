package com.email.assistant.controller;

import com.email.assistant.dto.EmailRequest;
import com.email.assistant.dto.EmailResponse;
import com.email.assistant.service.EmailGeneratorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/email")
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    public EmailGeneratorController(EmailGeneratorService emailGeneratorService) {
        this.emailGeneratorService = emailGeneratorService;
    }

    @PostMapping("/generate")
    public ResponseEntity<EmailResponse> generateEmail(@Valid @RequestBody EmailRequest request) {
        String reply = emailGeneratorService.generateReply(request);
        return ResponseEntity.ok(new EmailResponse(reply));
    }
}
