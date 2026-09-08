package com.schoolapp.service;

import com.schoolapp.dto.MarkRequest;
import com.schoolapp.entity.Mark;
import com.schoolapp.repository.MarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MarkService {

    private final MarkRepository markRepository;

    public MarkService(MarkRepository markRepository) {
        this.markRepository = markRepository;
    }

    @Transactional
    public Mark saveMark(MarkRequest request) {
        LocalDate examDate = request.getExamDate() != null ? request.getExamDate() : LocalDate.now();
        Integer maxMarks = request.getMaxMarks() != null ? request.getMaxMarks() : 100;
        Integer marksObtained = request.getMarksObtained() != null ? request.getMarksObtained() : 0;

        // Find existing record by unique constraint (student_id, subject, exam_type, exam_date)
        Mark mark = markRepository
                .findByStudentIdAndSubjectAndExamTypeAndExamDate(
                        request.getStudentId(),
                        request.getSubject(),
                        request.getExamType(),
                        examDate
                )
                .orElse(new Mark());

        mark.setStudentId(request.getStudentId());
        mark.setSubject(request.getSubject());
        mark.setExamType(request.getExamType());
        mark.setExamDate(examDate);
        mark.setMaxMarks(maxMarks);
        mark.setMarksObtained(marksObtained);

        return markRepository.save(mark);
    }

    public List<Mark> getMarks(String subject, String examType, LocalDate examDate) {
        if (subject != null && examType != null && examDate != null) {
            return markRepository.findBySubjectAndExamTypeAndExamDate(subject, examType, examDate);
        }
        return markRepository.findAll();
    }
}