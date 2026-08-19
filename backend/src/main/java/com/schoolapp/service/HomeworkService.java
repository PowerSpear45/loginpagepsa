package com.schoolapp.service;

import com.schoolapp.dto.HomeworkRequest;
import com.schoolapp.entity.Homework;
import com.schoolapp.entity.HomeworkSubmission;
import com.schoolapp.repository.HomeworkRepository;
import com.schoolapp.repository.HomeworkSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HomeworkService {

    @Autowired
    private HomeworkRepository homeworkRepository;

    @Autowired
    private HomeworkSubmissionRepository submissionRepository;

    public List<Homework> getHomeworks(Integer teacherId, String className, String section) {
        if (teacherId != null) {
            return homeworkRepository.findByTeacherIdOrderByHomeworkIdDesc(teacherId);
        } else if (className != null && section != null) {
            return homeworkRepository.findByClassNameAndSectionOrderByHomeworkIdDesc(className, section);
        }
        return homeworkRepository.findAllByOrderByHomeworkIdDesc();
    }

    public Homework saveHomework(HomeworkRequest request) {
        Homework hw = new Homework();
        hw.setTitle(request.getTitle());
        hw.setDescription(request.getDescription());
        hw.setClassName(request.getClassName());
        hw.setSection(request.getSection());
        hw.setSubject(request.getSubject());
        hw.setDueDate(request.getDueDate());
        hw.setTeacherId(request.getTeacherId());
        hw.setFileName(request.getFileName());
        hw.setFileData(request.getFileData());
        return homeworkRepository.save(hw);
    }

    public List<HomeworkSubmission> getSubmissionsByHomeworkId(Long homeworkId) {
        return submissionRepository.findByHomeworkId(homeworkId);
    }

    public HomeworkSubmission submitHomework(HomeworkSubmission submission) {
        return submissionRepository.findByHomeworkIdAndStudentId(submission.getHomeworkId(), submission.getStudentId())
                .map(existing -> {
                    existing.setFileName(submission.getFileName());
                    existing.setFileData(submission.getFileData());
                    existing.setStatus("Submitted");
                    return submissionRepository.save(existing);
                }).orElseGet(() -> submissionRepository.save(submission));
    }
}
