package com.applywise.backend.ai;

import com.applywise.backend.exception.AiUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.time.Duration;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final RestClient client;
    private final String apiKey;
    private final String model;

    public GeminiService(
            @Value("${application.ai.api-key:}") String apiKey,
            @Value("${application.ai.model}") String model,
            @Value("${application.ai.base-url}") String baseUrl) {

        this.apiKey = apiKey;
        this.model = model;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(45));

        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    // Envoie un prompt à Gemini et retourne le texte généré
    @SuppressWarnings("unchecked")
    public String generate(String systemPrompt, String userPrompt) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new AiUnavailableException("AI is not configured on the server");
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", userPrompt))
                )),
                "generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 2048)
        );

        try {
            Map<String, Object> response = client.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            return extractText(response);

        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            log.warn("Gemini returned {}: {}", status, e.getResponseBodyAsString());

            if (status == 429) {
                throw new AiUnavailableException(
                        "The AI limit is reached for now. Try again in a minute.");
            }
            throw new AiUnavailableException("The AI service could not answer. Try again later.");

        } catch (RestClientException e) {
            log.warn("Could not reach Gemini: {}", e.getMessage());
            throw new AiUnavailableException("The AI service is not reachable. Try again later.");
        }
    }

    // Lit candidates[0].content.parts[].text dans la réponse JSON
    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content =
                    (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) content.get("parts");

            StringBuilder text = new StringBuilder();
            for (Map<String, Object> part : parts) {
                Object value = part.get("text");
                if (value != null) {
                    text.append(value);
                }
            }

            if (!text.toString().isBlank()) {
                return text.toString().trim();
            }
        } catch (RuntimeException ignored) {
            // réponse inattendue: on tombe sur l'erreur ci-dessous
        }

        throw new AiUnavailableException("The AI returned an empty answer. Try again.");
    }
}