package com.schoolapp.controller;

import com.schoolapp.entity.Teacher;
import com.schoolapp.repository.TeacherRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherRepository teacherRepository;

    public TeacherController(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @GetMapping("/{id}")
    public Teacher getTeacherById(@PathVariable Integer id) {
        return teacherRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Teacher addTeacher(@RequestBody Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    @PutMapping("/{id}")
    public Teacher updateTeacher(@PathVariable Integer id, @RequestBody Teacher updatedTeacher) {
        return teacherRepository.findById(id).map(teacher -> {
            teacher.setFullName(updatedTeacher.getFullName());
            teacher.setGender(updatedTeacher.getGender());
            teacher.setDepartment(updatedTeacher.getDepartment());
            teacher.setSubject(updatedTeacher.getSubject());
            teacher.setQualification(updatedTeacher.getQualification());
            teacher.setEmail(updatedTeacher.getEmail());
            teacher.setPhone(updatedTeacher.getPhone());
            teacher.setJoiningDate(updatedTeacher.getJoiningDate());
            teacher.setAddress(updatedTeacher.getAddress());
            teacher.setPhoto(updatedTeacher.getPhoto());
            teacher.setStatus(updatedTeacher.getStatus());

            return teacherRepository.save(teacher);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String deleteTeacher(@PathVariable Integer id) {
        teacherRepository.deleteById(id);
        return "Teacher deleted successfully";
    }
}
