package com.codesensei.ai_commenter.dtos;

import lombok.Data;

@Data
public class CodeResponseDTO {
    String commentedCode; // Codigo con los comentarios generados
    String message; // Mensaje informativo sobre la operacion
    boolean success; // Indica si la operacion fue exitosa
}
