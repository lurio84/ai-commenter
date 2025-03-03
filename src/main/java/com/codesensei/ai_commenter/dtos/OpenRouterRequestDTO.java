package com.codesensei.ai_commenter.dtos;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpenRouterRequestDTO {
    private List<Map<String, String>> messages;
    private String model;
    private double temperature;
    private int max_tokens;
}
