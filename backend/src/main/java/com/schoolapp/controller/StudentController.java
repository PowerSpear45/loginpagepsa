package com.schoolapp.controller;

import com.schoolapp.entity.Student;
import com.schoolapp.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        if (student.getStatus() == null) {
            student.setStatus("ACTIVE");
        }
        return studentRepository.save(student);
    }
    @PutMapping("/{id}")
public Student updateStudent(@PathVariable Integer id, @RequestBody Student updatedStudent) {
    Student existingStudent = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    existingStudent.setFullName(updatedStudent.getFullName());
    existingStudent.setAdmissionNo(updatedStudent.getAdmissionNo());
    existingStudent.setRollNo(updatedStudent.getRollNo());
    existingStudent.setDateOfBirth(updatedStudent.getDateOfBirth());
    existingStudent.setGender(updatedStudent.getGender());
    existingStudent.setClassName(updatedStudent.getClassName());
    existingStudent.setSection(updatedStudent.getSection());
    existingStudent.setStatus("ACTIVE");

    return studentRepository.save(existingStudent);
}
@DeleteMapping("/{id}")
public String deleteStudent(@PathVariable Integer id) {
    studentRepository.deleteById(id);
    return "Student deleted successfully";
}
}
