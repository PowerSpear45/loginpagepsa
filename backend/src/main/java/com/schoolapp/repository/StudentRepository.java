package com.schoolapp.repository;

import com.schoolapp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    long countByStatus(String status);
}
