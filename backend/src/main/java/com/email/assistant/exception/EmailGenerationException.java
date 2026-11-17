package com.email.assistant.exception;

/** Thrown when the LLM call fails or returns an unusable result. */
public class EmailGenerationException extends RuntimeException {

    public EmailGenerationException(String message) {
        super(message);
    }

    public EmailGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
