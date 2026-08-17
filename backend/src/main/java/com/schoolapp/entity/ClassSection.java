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
    private Integer classTeacher;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Integer getStrength() {
        return strength;
    }

    public void setStrength(Integer strength) {
        this.strength = strength;
    }

    public Integer getClassTeacher() {
        return classTeacher;
    }

    public void setClassTeacher(Integer classTeacher) {
        this.classTeacher = classTeacher;
    }
}
