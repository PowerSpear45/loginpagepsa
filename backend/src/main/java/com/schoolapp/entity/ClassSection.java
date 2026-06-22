package com.schoolapp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "class_section")
public class ClassSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_name")
    private String className;

    private String section;

    private Integer strength;

    @Column(name = "class_teacher")
    private String classTeacher;

    public Long getId() {
        return id;
    }

    public String getClassName() {
        return className;
    }

    public String getSection() {
        return section;
    }

    public Integer getStrength() {
        return strength;
    }

    public String getClassTeacher() {
        return classTeacher;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public void setStrength(Integer strength) {
        this.strength = strength;
    }

    public void setClassTeacher(String classTeacher) {
        this.classTeacher = classTeacher;
    }
}
