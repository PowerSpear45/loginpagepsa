package com.schoolapp.service;

import com.schoolapp.dto.TeacherClassResponse;
import com.schoolapp.entity.ClassSection;
import com.schoolapp.entity.Teacher;
import com.schoolapp.repository.ClassSectionRepository;
import com.schoolapp.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherClassService {

    private final ClassSectionRepository classSectionRepository;
    private final TeacherRepository teacherRepository;

    public TeacherClassService(
            ClassSectionRepository classSectionRepository,
            TeacherRepository teacherRepository
    ) {
        this.classSectionRepository = classSectionRepository;
        this.teacherRepository = teacherRepository;
    }

    public List<TeacherClassResponse> getTeacherClasses(Integer teacherId) {

        Teacher teacher = teacherRepository
                .findById(teacherId)
                .orElseThrow(() ->
                        new RuntimeException("Teacher not found")
                );

        List<ClassSection> classes =
                classSectionRepository.findByClassTeacher(teacherId);

        return classes.stream()
                .map(classSection ->
                        new TeacherClassResponse(
                                classSection.getClassName(),
                                classSection.getSection(),
                                teacher.getSubject(),
                                classSection.getStrength(),
                                true
                        )
                )
                .toList();
    }
}
