package com.schoolapp.repository;

import com.schoolapp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Integer> {

    long countByStatus(String status);

    List<Student> findByClassNameAndSection(String className, String section);
}
