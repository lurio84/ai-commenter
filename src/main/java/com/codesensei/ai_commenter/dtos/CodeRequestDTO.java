package com.codesensei.ai_commenter.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CodeRequestDTO {
    @Schema(description = "Code to comment", example = "public int sumar(int a, int b) { return a + b; }")
    String code; // El codigo que el usuario desea comentar
    @Schema(description = "Additional information about the code.", example = "")
    String description; // El usuario puede proporcionar informacion adicional sobre el codigo
    @Schema(description = "The programming language", example = "Java")
    String codeLanguage; // El lenguaje de programacion del codigo
    @Schema(description = "The language to get the comment", example = "English")
    String userLanguage; // El lenguaje en el que el usuario desea recibir el comentario
}
