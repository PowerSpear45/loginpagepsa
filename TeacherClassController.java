package com.schoolapp.controller;

import com.schoolapp.dto.TeacherClassResponse;
import com.schoolapp.service.TeacherClassService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherClassController {

    private final TeacherClassService teacherClassService;

    public TeacherClassController(
            TeacherClassService teacherClassService
    ) {
        this.teacherClassService = teacherClassService;
    }

    @GetMapping("/{teacherId}/classes")
    public List<TeacherClassResponse> getTeacherClasses(
            @PathVariable Integer teacherId
    ) {
        return teacherClassService
                .getTeacherClasses(teacherId);
    }
}

