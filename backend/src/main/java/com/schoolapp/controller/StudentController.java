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


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }


    // =========================================================
    // GET ALL STUDENTS
    // =========================================================

    @GetMapping
    public List<Student> getAllStudents() {

        return studentRepository.findAll();

    }


    // =========================================================
    // ADD NEW STUDENT
    // =========================================================

    @PostMapping
    public Student addStudent(@RequestBody Student student) {

        // If status is not provided,
        // automatically make the student ACTIVE.

        if (student.getStatus() == null ||
            student.getStatus().isBlank()) {

            student.setStatus("ACTIVE");

        }

        return studentRepository.save(student);

    }


    // =========================================================
    // UPDATE STUDENT
    // =========================================================

    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Integer id,
            @RequestBody Student updatedStudent) {


        // -----------------------------------------------------
        // FIND EXISTING STUDENT
        // -----------------------------------------------------

        Student existingStudent =
                studentRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Student not found with ID: " + id
                                )
                        );


        // =====================================================
        // STUDENT DETAILS
        // =====================================================

        existingStudent.setFullName(
                updatedStudent.getFullName()
        );


        existingStudent.setAdmissionNo(
                updatedStudent.getAdmissionNo()
        );


        existingStudent.setRollNo(
                updatedStudent.getRollNo()
        );


        existingStudent.setDateOfBirth(
                updatedStudent.getDateOfBirth()
        );


        existingStudent.setGender(
                updatedStudent.getGender()
        );


        existingStudent.setClassName(
                updatedStudent.getClassName()
        );


        existingStudent.setSection(
                updatedStudent.getSection()
        );


        // =====================================================
        // PERSONAL DETAILS
        // =====================================================

        existingStudent.setBloodGroup(
                updatedStudent.getBloodGroup()
        );


        existingStudent.setNationality(
                updatedStudent.getNationality()
        );


        existingStudent.setMotherTongue(
                updatedStudent.getMotherTongue()
        );


        existingStudent.setReligion(
                updatedStudent.getReligion()
        );


        existingStudent.setFirstLanguage(
                updatedStudent.getFirstLanguage()
        );


        existingStudent.setSecondLanguage(
                updatedStudent.getSecondLanguage()
        );


        existingStudent.setThirdLanguage(
                updatedStudent.getThirdLanguage()
        );


        // =====================================================
        // ADDRESS DETAILS
        // =====================================================

        existingStudent.setCurrentAddress(
                updatedStudent.getCurrentAddress()
        );


        existingStudent.setCity(
                updatedStudent.getCity()
        );


        existingStudent.setState(
                updatedStudent.getState()
        );


        existingStudent.setCityPincode(
                updatedStudent.getCityPincode()
        );


        // =====================================================
        // FATHER DETAILS
        // =====================================================

        existingStudent.setFatherName(
                updatedStudent.getFatherName()
        );


        existingStudent.setFatherQualification(
                updatedStudent.getFatherQualification()
        );


        existingStudent.setFatherCompany(
                updatedStudent.getFatherCompany()
        );


        existingStudent.setFatherOccupation(
                updatedStudent.getFatherOccupation()
        );


        // =====================================================
        // MOTHER DETAILS
        // =====================================================

        existingStudent.setMotherName(
                updatedStudent.getMotherName()
        );


        existingStudent.setMotherQualification(
                updatedStudent.getMotherQualification()
        );


        existingStudent.setMotherCompany(
                updatedStudent.getMotherCompany()
        );


        existingStudent.setMotherOccupation(
                updatedStudent.getMotherOccupation()
        );


        // =====================================================
        // STUDENT PHOTO
        // =====================================================

        existingStudent.setStudentPhoto(
                updatedStudent.getStudentPhoto()
        );


        // =====================================================
        // STATUS
        // =====================================================

        existingStudent.setStatus("ACTIVE");


        // =====================================================
        // SAVE
        // =====================================================

        return studentRepository.save(existingStudent);

    }


    // =========================================================
    // DELETE STUDENT
    // =========================================================

    @DeleteMapping("/{id}")
    public String deleteStudent(
            @PathVariable Integer id) {


        // Check whether student exists first

        if (!studentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Student not found with ID: " + id
            );

        }


        studentRepository.deleteById(id);


        return "Student deleted successfully";

    }

}