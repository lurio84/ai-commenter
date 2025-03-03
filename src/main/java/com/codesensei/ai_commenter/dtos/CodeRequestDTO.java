package com.codesensei.ai_commenter.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CodeRequestDTO {
    String code; // El codigo que el usuario desea comentar
    String description; // El usuario puede proporcionar informacion adicional sobre el codigo
    String codeLanguage; // El lenguaje de programacion del codigo
    String userLanguage; // El lenguaje en el que el usuario desea recibir el comentario
}
