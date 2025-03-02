package com.codesensei.ai_commenter.controllers;

import com.codesensei.ai_commenter.dtos.CodeRequestDTO;
import com.codesensei.ai_commenter.dtos.CodeResponseDTO;
import com.codesensei.ai_commenter.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/comment")
    public ResponseEntity<CodeResponseDTO> getComment(@RequestBody CodeRequestDTO requestDTO) {
        CodeResponseDTO response = commentService.getComment(requestDTO);
        return ResponseEntity.ok(response);
    }
}
