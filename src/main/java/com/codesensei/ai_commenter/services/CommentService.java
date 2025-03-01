package com.codesensei.ai_commenter.services;

import org.springframework.stereotype.Service;

import com.codesensei.ai_commenter.models.CodeResponse;

@Service
public class CommentService {

    public CodeResponse getComment(String code, String description, String codeLanguage, String userLanguage) {
        // TODO: Implementar llamada a API OpenAI y lógica del servicio
        return null;
    }
}
