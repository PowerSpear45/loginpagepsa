package com.schoolapp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "teacher")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "teacher_id")
    private Integer teacherId;

    @Column(name = "full_name")
    private String fullName;

    private String subject;
    private String status;

    public Integer getTeacherId() {
        return teacherId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getSubject() {
        return subject;
    }

    public String getStatus() {
        return status;
    }
}