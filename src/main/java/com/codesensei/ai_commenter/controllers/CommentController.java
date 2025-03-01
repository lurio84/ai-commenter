package com.codesensei.ai_commenter.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.codesensei.ai_commenter.models.CodeResponse;
import com.codesensei.ai_commenter.services.CommentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api")
@Tag(name = "Comentarios", description = "API para obtener comentarios de código") // Organiza la API
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/comment")
    @Operation(summary = "Genera un comentario de código", description = "Recibe código, descripción, lenguaje de programación y lenguaje del usuario para generar un comentario.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comentario generado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud incorrecta"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public CodeResponse getComment(@RequestBody String code, @RequestBody String description,
            @RequestBody String codeLanguage, @RequestBody String userLanguage) {
        return commentService.getComment(code, description, codeLanguage, userLanguage);
    }

}
