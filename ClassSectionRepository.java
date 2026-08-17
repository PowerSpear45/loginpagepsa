package com.schoolapp.repository;

import com.schoolapp.entity.ClassSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassSectionRepository extends JpaRepository<ClassSection, Long> {

    List<ClassSection> findByClassTeacher(Integer classTeacher);

}
