package com.codesensei.ai_commenter.models;

import lombok.Data;

@Data
public class CodeRequest {
    String code; // El codigo que el usuario desea comentar
    String description; // El usuario puede proporcionar informacion adicional sobre el codigo
    String codeLanguage; // El lenguaje de programacion del codigo
    String userLanguage; // El lenguaje en el que el usuario desea recibir el comentario
}
