package com.email.assistant.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload for POST /api/email/generate.
 *
 * @param emailContent the received email text (required)
 * @param tone         desired tone of the reply, e.g. Professional, Casual, Friendly (optional)
 */
public record EmailRequest(
        @NotBlank(message = "emailContent must not be empty") String emailContent,
        String tone) {
}
