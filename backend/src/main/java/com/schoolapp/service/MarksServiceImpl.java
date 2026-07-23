package com.schoolapp.service;

import com.schoolapp.dto.MarksDTO;
import com.schoolapp.entity.Marks;
import com.schoolapp.entity.Student;
import com.schoolapp.repository.MarksRepository;
import com.schoolapp.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MarksServiceImpl implements MarksService {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private StudentRepository studentRepository;

    // ===========================================
    // Get All Students Marks
    // ===========================================

    @Override
    public List<MarksDTO> getAllMarks() {

        List<Student> students = studentRepository.findAll();

        List<MarksDTO> dtoList = new ArrayList<>();

        for (Student student : students) {

            List<Marks> marksList =
                    marksRepository.findByStudentStudentId(student.getStudentId());

            MarksDTO dto = new MarksDTO();

            dto.setStudentId(student.getStudentId());
            dto.setRollNo(student.getRollNo());
            dto.setFullName(student.getFullName());
            dto.setClassName(student.getClassName());
            dto.setSection(student.getSection());
            dto.setStudentPhoto(student.getStudentPhoto());

            if (!marksList.isEmpty()) {

                Marks marks = marksList.get(0);

                dto.setAcademicYear(marks.getAcademicYear());
                dto.setExamName(marks.getExamName());

                dto.setTamil(marks.getTamil());
                dto.setEnglish(marks.getEnglish());
                dto.setMaths(marks.getMaths());
                dto.setScience(marks.getScience());
                dto.setSocial(marks.getSocial());
                dto.setComputer(marks.getComputer());

                dto.setTotal(marks.getTotal());
                dto.setPercentage(marks.getPercentage());
                dto.setGrade(marks.getGrade());
                dto.setRemarks(marks.getRemarks());

            } else {

                dto.setTamil(0);
                dto.setEnglish(0);
                dto.setMaths(0);
                dto.setScience(0);
                dto.setSocial(0);
                dto.setComputer(0);

                dto.setTotal(0);

            }

            dtoList.add(dto);

        }

        return dtoList;

    }
        // ===========================================
    // Get Marks By Student ID
    // ===========================================

    @Override
    public MarksDTO getMarksByStudentId(Integer studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Marks> marksList =
                marksRepository.findByStudentStudentId(studentId);

        MarksDTO dto = new MarksDTO();

        dto.setStudentId(student.getStudentId());
        dto.setRollNo(student.getRollNo());
        dto.setFullName(student.getFullName());
        dto.setClassName(student.getClassName());
        dto.setSection(student.getSection());
        dto.setStudentPhoto(student.getStudentPhoto());

        if (!marksList.isEmpty()) {

            Marks marks = marksList.get(0);

            dto.setAcademicYear(marks.getAcademicYear());
            dto.setExamName(marks.getExamName());

            dto.setTamil(marks.getTamil());
            dto.setEnglish(marks.getEnglish());
            dto.setMaths(marks.getMaths());
            dto.setScience(marks.getScience());
            dto.setSocial(marks.getSocial());
            dto.setComputer(marks.getComputer());

            dto.setTotal(marks.getTotal());
            dto.setPercentage(marks.getPercentage());
            dto.setGrade(marks.getGrade());
            dto.setRemarks(marks.getRemarks());

        } else {

            dto.setTamil(0);
            dto.setEnglish(0);
            dto.setMaths(0);
            dto.setScience(0);
            dto.setSocial(0);
            dto.setComputer(0);

            dto.setTotal(0);

        }

        return dto;

    }
        // ===========================================
    // Save Marks
    // ===========================================

    @Override
    public MarksDTO saveMarks(MarksDTO dto) {

        Marks marks = marksRepository
                .findByStudentStudentIdAndExamName(
                        dto.getStudentId(),
                        dto.getExamName()
                )
                .orElse(null);

        if (marks == null) {

            marks = new Marks();

            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            marks.setStudent(student);

        }

        marks.setAcademicYear(dto.getAcademicYear());
        marks.setExamName(dto.getExamName());

        marks.setTamil(dto.getTamil());
        marks.setEnglish(dto.getEnglish());
        marks.setMaths(dto.getMaths());
        marks.setScience(dto.getScience());
        marks.setSocial(dto.getSocial());
        marks.setComputer(dto.getComputer());

        // ==========================
        // Calculate Total
        // ==========================

        int total =
                dto.getTamil()
                + dto.getEnglish()
                + dto.getMaths()
                + dto.getScience()
                + dto.getSocial()
                + dto.getComputer();

        marks.setTotal(total);

        // ==========================
        // Calculate Percentage
        // ==========================

        double percentage = (total / 600.0) * 100;

        marks.setPercentage(
                java.math.BigDecimal.valueOf(percentage)
        );

        // ==========================
        // Calculate Grade
        // ==========================

        if (percentage >= 90)
            marks.setGrade("A+");
        else if (percentage >= 80)
            marks.setGrade("A");
        else if (percentage >= 70)
            marks.setGrade("B");
        else if (percentage >= 60)
            marks.setGrade("C");
        else if (percentage >= 50)
            marks.setGrade("D");
        else
            marks.setGrade("F");

        marks.setRemarks(dto.getRemarks());

        marksRepository.save(marks);

        return getMarksByStudentId(dto.getStudentId());

    }

    // ===========================================
    // Delete Marks
    // ===========================================

    @Override
    public void deleteMarks(Integer studentId) {

        List<Marks> marksList =
                marksRepository.findByStudentStudentId(studentId);

        marksRepository.deleteAll(marksList);

    }

}