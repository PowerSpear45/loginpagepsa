package com.schoolapp.dto;

public class TeacherClassResponse {

    private String className;
    private String section;
    private String subject;
    private Integer studentCount;
    private boolean classTeacher;

    public TeacherClassResponse(
            String className,
            String section,
            String subject,
            Integer studentCount,
            boolean classTeacher
    ) {
        this.className = className;
        this.section = section;
        this.subject = subject;
        this.studentCount = studentCount;
        this.classTeacher = classTeacher;
    }

    public String getClassName() {
        return className;
    }

    public String getSection() {
        return section;
    }

    public String getSubject() {
        return subject;
    }

    public Integer getStudentCount() {
        return studentCount;
    }

    public boolean isClassTeacher() {
        return classTeacher;
    }
}