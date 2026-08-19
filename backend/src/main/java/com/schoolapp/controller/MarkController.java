package com.schoolapp.controller;

import com.schoolapp.dto.MarkRequest;
import com.schoolapp.entity.Mark;
import com.schoolapp.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/marks")
@CrossOrigin(origins = "*")
public class MarkController {

    @Autowired
    private MarkService markService;

    @GetMapping
    public ResponseEntity<List<Mark>> getMarks(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String examType) {
        return ResponseEntity.ok(markService.getMarks(className, section, examType));
    }

    @PostMapping
    public ResponseEntity<Mark> saveMark(@RequestBody MarkRequest markRequest) {
        return ResponseEntity.ok(markService.saveMark(markRequest));
    }
}
