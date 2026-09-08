package com.schoolapp.controller;

import com.schoolapp.dto.MarkRequest;
import com.schoolapp.entity.Mark;
import com.schoolapp.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/marks")
@CrossOrigin(origins = "*")
public class MarkController {

    @Autowired
    private MarkService markService;

    @GetMapping
    public ResponseEntity<List<Mark>> getMarks(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate examDate) {
        return ResponseEntity.ok(markService.getMarks(subject, examType, examDate));
    }

    @PostMapping
    public ResponseEntity<Mark> saveMark(@RequestBody MarkRequest markRequest) {
        return ResponseEntity.ok(markService.saveMark(markRequest));
    }

    @PostMapping("/save-all")
    public ResponseEntity<List<Mark>> saveAllMarks(@RequestBody List<MarkRequest> requests) {
        List<Mark> marks = requests.stream()
                .map(markService::saveMark)
                .toList();
        return ResponseEntity.ok(marks);
    }
}