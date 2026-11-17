package com.email.assistant.service;

import com.email.assistant.dto.EmailRequest;
import com.email.assistant.exception.EmailGenerationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class EmailGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(EmailGeneratorService.class);

    private static final Set<String> NO_TONE = Set.of("", "none", "default");

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant that writes replies to emails.
            Rules:
            - Address the specific points, questions and requests raised in the original email.
            - Output ONLY the body of the reply: no subject line, no explanations, no markdown.
            - Do not invent facts, dates, prices or commitments that are not implied by the email;
              use a short placeholder in square brackets (e.g. [date]) where specific details are needed.
            - End with an appropriate sign-off, using [Your Name] in place of the sender's name.
            """;

    private final ChatClient chatClient;
    private final int maxLength;

    public EmailGeneratorService(ChatClient.Builder chatClientBuilder,
                                 @Value("${app.email.max-length:20000}") int maxLength) {
        this.chatClient = chatClientBuilder.defaultSystem(SYSTEM_PROMPT).build();
        this.maxLength = maxLength;
    }

    public String generateReply(EmailRequest request) {
        String content = request.emailContent().strip();
        if (content.length() > maxLength) {
            throw new IllegalArgumentException(
                    "emailContent is too long (max " + maxLength + " characters)");
        }

        String prompt = buildPrompt(content, request.tone());

        String reply;
        try {
            reply = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception ex) {
            log.warn("OpenAI call failed: {}", ex.getMessage());
            throw new EmailGenerationException(
                    "The AI service could not generate a reply. Check the API key and try again.", ex);
        }

        if (reply == null || reply.isBlank()) {
            throw new EmailGenerationException("The AI service returned an empty reply");
        }
        return reply.strip();
    }

    String buildPrompt(String emailContent, String tone) {
        StringBuilder prompt = new StringBuilder("Generate a reply to the following email.");
        if (tone != null && !NO_TONE.contains(tone.strip().toLowerCase())) {
            prompt.append(" Use a ").append(tone.strip().toLowerCase()).append(" tone.");
        }
        prompt.append("\n\nOriginal email:\n\"\"\"\n").append(emailContent).append("\n\"\"\"");
        return prompt.toString();
    }
}
