package com.codesensei.ai_commenter.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.codesensei.ai_commenter.services.CommentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/comment")
    public CodeResponse getComment(@RequestBody String code, @RequestBody String description,
            @RequestBody String codeLanguage, @RequestBody String userLanguage) {
        return commentService.getComment(code, description, codeLanguage, userLanguage);
    }

}
