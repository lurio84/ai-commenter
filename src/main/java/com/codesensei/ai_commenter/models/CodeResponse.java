package com.codesensei.ai_commenter.models;

import lombok.Data;

@Data
public class CodeResponse {
    String commentedCode; // Codigo con los comentarios generados
    String message; // Mensaje informativo sobre la operacion
    boolean success; // Indica si la operacion fue exitosa
}
