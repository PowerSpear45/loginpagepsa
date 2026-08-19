package com.schoolapp.controller;

import com.schoolapp.dto.MarkRequest;
import com.schoolapp.entity.Mark;
import com.schoolapp.service.MarkService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*")
public class MarkController {

    private final MarkService markService;

    public MarkController(MarkService markService) {
        this.markService = markService;
    }

    /*
     * SAVE ONE STUDENT'S MARK
     *
     * POST /api/marks/save
     */
    @PostMapping("/save")
    public ResponseEntity<Mark> saveMark(
            @RequestBody MarkRequest request
    ) {

        Mark savedMark = markService.saveMark(request);

        return ResponseEntity.ok(savedMark);
    }


    /*
     * SAVE MARKS FOR MULTIPLE STUDENTS
     *
     * POST /api/marks/save-all
     */
    @PostMapping("/save-all")
    public ResponseEntity<List<Mark>> saveMarks(
            @RequestBody List<MarkRequest> requests
    ) {

        List<Mark> savedMarks = markService.saveMarks(requests);

        return ResponseEntity.ok(savedMarks);
    }


    /*
     * GET MARKS
     *
     * GET /api/marks
     *
     * Example:
     * /api/marks?subject=Mathematics
     * &examType=Unit%20Test
     * &examDate=2026-08-19
     */
    @GetMapping
    public ResponseEntity<List<Mark>> getMarks(
            @RequestParam String subject,
            @RequestParam String examType,
            @RequestParam String examDate
    ) {

        LocalDate date = LocalDate.parse(examDate);

        List<Mark> marks =
                markService.getMarks(
                        subject,
                        examType,
                        date
                );

        return ResponseEntity.ok(marks);
    }
}
