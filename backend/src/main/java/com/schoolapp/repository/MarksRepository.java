package com.schoolapp.repository;

import com.schoolapp.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MarksRepository extends JpaRepository<Marks, Long> {

    List<Marks> findByStudentStudentId(Integer studentId);

    List<Marks> findByExamId(Long examId);



    // Marks by academic year
    List<Marks> findByAcademicYear(String academicYear);

    // One student's marks for a particular exam
    Optional<Marks> findByStudentStudentIdAndExamName(
            Integer studentId,
            String examName
    );

    // One student's marks for a particular exam in a particular academic year
    Optional<Marks> findByStudentStudentIdAndExamNameAndAcademicYear(
            Integer studentId,
            String examName,
            String academicYear
    );

}