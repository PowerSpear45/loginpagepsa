package com.schoolapp.repository;

import com.schoolapp.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MarkRepository
        extends JpaRepository<Mark, Long> {

    Optional<Mark> findByStudentIdAndSubjectAndExamTypeAndExamDate(
            Integer studentId,
            String subject,
            String examType,
            LocalDate examDate
    );


    List<Mark> findBySubjectAndExamTypeAndExamDate(
            String subject,
            String examType,
            LocalDate examDate
    );
}
