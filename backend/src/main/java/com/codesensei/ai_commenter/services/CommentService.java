package com.codesensei.ai_commenter.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.codesensei.ai_commenter.dtos.CodeRequestDTO;
import com.codesensei.ai_commenter.dtos.CodeResponseDTO;
import com.codesensei.ai_commenter.dtos.OpenRouterRequestDTO;
import com.codesensei.ai_commenter.dtos.OpenRouterResponseDTO;

import java.util.*;

@Service
public class CommentService {

    @Value("${OPENROUTER_API_KEY}")
    private String apiKey;

    @Value("${OPENROUTER_API_URL}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public CodeResponseDTO generateComment(CodeRequestDTO requestDTO) {
        // Convertir CodeRequestDTO a OpenRouterRequestDTO
        OpenRouterRequestDTO openRouterRequest = transformToOpenRouterRequest(requestDTO);

        // Configurar headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // Enviar solicitud a OpenRouter
        HttpEntity<OpenRouterRequestDTO> requestEntity = new HttpEntity<>(openRouterRequest, headers);

        try {
            ResponseEntity<OpenRouterResponseDTO> responseEntity = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, requestEntity, OpenRouterResponseDTO.class);

            // Procesar respuesta y transformarla a CodeResponseDTO
            System.out.println("Response: " + responseEntity.getBody());
            return processOpenRouterResponse(responseEntity.getBody());
        } catch (Exception e) {
            return new CodeResponseDTO(null, "Error en OpenRouter: " + e.getMessage(), false);
        }
    }

    // Metodo para transformar nuestro DTO al formato de OpenRouter
    private OpenRouterRequestDTO transformToOpenRouterRequest(CodeRequestDTO requestDTO) {
        // Mapeo de lenguajes a sus formatos de documentación
        Map<String, String> commentStyles = new HashMap<>();
        commentStyles.put("java", "JavaDoc");
        commentStyles.put("python", "Docstring");
        commentStyles.put("c#", "XMLDoc");
        commentStyles.put("javascript", "JSDoc");
        commentStyles.put("typescript", "JSDoc");
        commentStyles.put("php", "PHPDoc");
        commentStyles.put("go", "Godoc");
        commentStyles.put("swift", "SwiftDoc");

        // Convertir el lenguaje a minúsculas para hacer la búsqueda
        String languageKey = requestDTO.getCodeLanguage().toLowerCase();

        // Obtener el estilo de comentarios basado en el lenguaje, con un valor por
        // defecto
        String commentStyle = commentStyles.getOrDefault(languageKey, "block");

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
                "You are a " + requestDTO.getCodeLanguage()
                        + " documentation assistant. Always return only the " + commentStyle
                        + " comment without any extra text. Language: "
                        + requestDTO.getUserLanguage()));
        messages.add(Map.of("role", "user", "content",
                "Comment the following code: " + requestDTO.getCode()));
        System.out.println("Request: " + messages);
        return new OpenRouterRequestDTO(messages, "deepseek/deepseek-chat:free", 0.2, 100);
    }

    // Metodo para transformar la respuesta de OpenRouter a nuestro DTO
    private CodeResponseDTO processOpenRouterResponse(OpenRouterResponseDTO responseBody) {
        if (responseBody != null && responseBody.getChoices() != null && !responseBody.getChoices().isEmpty()) {
            String commentedCode = responseBody.getChoices().get(0).getMessage().getContent();
            System.out.println("Response content: " + commentedCode);
            return new CodeResponseDTO(commentedCode, "Comentario generado con éxito", true);
        }
        return new CodeResponseDTO(null, "Respuesta de OpenRouter no válida", false);
    }
}
