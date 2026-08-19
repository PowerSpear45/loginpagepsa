package com.schoolapp.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "marks",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {
                "student_id",
                "subject",
                "exam_type",
                "exam_date"
            }
        )
    }
)
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mark_id")
    private Long markId;


    @Column(name = "student_id", nullable = false)
    private Integer studentId;


    @Column(name = "subject", nullable = false)
    private String subject;


    @Column(name = "exam_type", nullable = false)
    private String examType;


    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;


    @Column(name = "max_marks", nullable = false)
    private Integer maxMarks;


    @Column(name = "marks_obtained", nullable = false)
    private Integer marksObtained;


    public Mark() {
    }


    public Long getMarkId() {
        return markId;
    }

    public void setMarkId(Long markId) {
        this.markId = markId;
    }


    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }


    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }


    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }


    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }


    public Integer getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
    }


    public Integer getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }
}
