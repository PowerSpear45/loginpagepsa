package com.schoolapp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "class_name")
    private String className;

    private String section;

    private String gender;

    private String status;

    public Integer getStudentId() {
        return studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getClassName() {
        return className;
    }

    public String getSection() {
        return section;
    }

    public String getGender() {
        return gender;
    }

    public String getStatus() {
        return status;
    }
}
