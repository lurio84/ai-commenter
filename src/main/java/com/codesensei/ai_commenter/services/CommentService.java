package com.codesensei.ai_commenter.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.codesensei.ai_commenter.dtos.CodeResponseDTO;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CommentService {

    @Value("${OPENROUTER_API_KEY}")
    private String apiUrl; // URL definida en application.properties

    public CodeResponseDTO getComment(String code, String description, String codeLanguage, String userLanguage) {
        System.out.println(apiUrl);
        // Construir el payload JSON
        Map<String, Object> payload = new HashMap<>();

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content",
                "You are a Java documentation assistant. Always return only the JavaDoc comment without any extra text. Language: English");

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", "Comment the following Java method:\n" + code);

        messages.add(systemMessage);
        messages.add(userMessage);

        payload.put("messages", messages);
        payload.put("model", "deepseek/deepseek-chat:free");
        payload.put("temperature", 0.2);
        payload.put("max_tokens", 100);

        // Configurar headers sin autenticación
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        RestTemplate restTemplate = new RestTemplate();
        CodeResponseDTO response = new CodeResponseDTO();

        try {
            ResponseEntity<CodeResponseDTO> responseEntity = restTemplate.postForEntity(apiUrl, requestEntity,
                    CodeResponseDTO.class);
            response = responseEntity.getBody();
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error al realizar la llamada a la API: " + e.getMessage());
        }

        return response;
    }
}
