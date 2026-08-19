package com.schoolapp.controller;

import com.schoolapp.dto.HomeworkRequest;
import com.schoolapp.entity.Homework;
import com.schoolapp.entity.HomeworkSubmission;
import com.schoolapp.service.HomeworkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/homework")
@CrossOrigin(origins = "*")
public class HomeworkController {

    @Autowired
    private HomeworkService homeworkService;

    @GetMapping
    public ResponseEntity<List<Homework>> getHomeworks(
            @RequestParam(required = false) Integer teacherId,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(homeworkService.getHomeworks(teacherId, className, section));
    }

    @PostMapping
    public ResponseEntity<Homework> createHomework(@RequestBody HomeworkRequest request) {
        return ResponseEntity.ok(homeworkService.saveHomework(request));
    }

    @GetMapping("/{homeworkId}/submissions")
    public ResponseEntity<List<HomeworkSubmission>> getSubmissions(@PathVariable Long homeworkId) {
        return ResponseEntity.ok(homeworkService.getSubmissionsByHomeworkId(homeworkId));
    }

    @PostMapping("/submit")
    public ResponseEntity<HomeworkSubmission> submitHomework(@RequestBody HomeworkSubmission submission) {
        return ResponseEntity.ok(homeworkService.submitHomework(submission));
    }
}
