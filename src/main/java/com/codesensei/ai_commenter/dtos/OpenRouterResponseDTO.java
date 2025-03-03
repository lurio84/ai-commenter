package com.codesensei.ai_commenter.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class OpenRouterResponseDTO {
    private List<Choice> choices;

    @Data
    @NoArgsConstructor
    public static class Choice {
        private Message message;
    }

    @Data
    @NoArgsConstructor
    public static class Message {
        private String content;
    }
}
