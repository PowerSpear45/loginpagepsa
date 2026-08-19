package com.schoolapp.repository;

import com.schoolapp.entity.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    List<Homework> findByTeacherIdOrderByHomeworkIdDesc(Integer teacherId);
    List<Homework> findByClassNameAndSectionOrderByHomeworkIdDesc(String className, String section);
    List<Homework> findAllByOrderByHomeworkIdDesc();
}
