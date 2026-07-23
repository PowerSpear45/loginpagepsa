package com.schoolapp.controller;

import com.schoolapp.dto.MarksDTO;
import com.schoolapp.service.MarksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*")
public class MarksController {

    @Autowired
    private MarksService marksService;

    // Get all students' marks
    @GetMapping
    public List<MarksDTO> getAllMarks() {
        return marksService.getAllMarks();
    }

    // Get all marks of one student
    @GetMapping("/student/{studentId}")
    public MarksDTO getMarksByStudentId(@PathVariable Integer studentId) {
        return marksService.getMarksByStudentId(studentId);
    }

    // Save or Update marks
    @PostMapping
    public MarksDTO saveMarks(@RequestBody MarksDTO marksDTO) {
        return marksService.saveMarks(marksDTO);
    }

    // Delete one marks record
    @DeleteMapping("/{studentId}")
public void deleteMarks(@PathVariable Integer studentId) {
    marksService.deleteMarks(studentId);

    }
}
