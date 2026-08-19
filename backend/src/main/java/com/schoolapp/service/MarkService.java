package com.schoolapp.service;

import com.schoolapp.dto.MarkRequest;
import com.schoolapp.entity.Mark;
import com.schoolapp.repository.MarkRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MarkService {

    private final MarkRepository markRepository;

    public MarkService(MarkRepository markRepository) {
        this.markRepository = markRepository;
    }

    /*
     * Save or update marks for one student
     */
    public Mark saveMark(MarkRequest request) {

        LocalDate examDate = request.getExamDate();

        /*
         * Check whether this student already has marks
         * for the same subject, exam type and exam date.
         */
        Mark mark = markRepository
                .findByStudentIdAndSubjectAndExamTypeAndExamDate(
                        request.getStudentId(),
                        request.getSubject(),
                        request.getExamType(),
                        examDate
                )
                .orElse(new Mark());

        /*
         * Set / update the mark information
         */
        mark.setStudentId(request.getStudentId());
        mark.setSubject(request.getSubject());
        mark.setExamType(request.getExamType());
        mark.setExamDate(examDate);
        mark.setMaxMarks(request.getMaxMarks());
        mark.setMarksObtained(request.getMarksObtained());

        /*
         * If the record already exists, save() updates it.
         * Otherwise, save() creates a new record.
         */
        return markRepository.save(mark);
    }


    /*
     * Save marks for multiple students
     */
    public List<Mark> saveMarks(List<MarkRequest> requests) {

        return requests.stream()
                .map(this::saveMark)
                .toList();
    }


    /*
     * Get marks for a particular subject,
     * exam type and exam date.
     */
    public List<Mark> getMarks(
            String subject,
            String examType,
            LocalDate examDate
    ) {

        return markRepository
                .findBySubjectAndExamTypeAndExamDate(
                        subject,
                        examType,
                        examDate
                );
    }
}