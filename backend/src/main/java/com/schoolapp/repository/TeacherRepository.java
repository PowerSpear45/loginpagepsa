package com.schoolapp.repository;

import com.schoolapp.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Integer> {

    long countByStatus(String status);

    long countByGender(String gender);

    long countByDepartment(String department);

}