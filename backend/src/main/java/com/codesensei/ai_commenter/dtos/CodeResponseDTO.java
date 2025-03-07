package com.codesensei.ai_commenter.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeResponseDTO {
    String commentedCode; // Codigo con los comentarios generados
    String message; // Mensaje informativo sobre la operacion
    boolean success; // Indica si la operacion fue exitosa
}
