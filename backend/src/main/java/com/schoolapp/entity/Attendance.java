package com.schoolapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Integer attendanceId;

    @Column(name = "student_id")
    private Integer studentId;

    @Column(name = "attendance_date")
    private LocalDate attendanceDate;

    private String status;

    public Integer getAttendanceId() {
        return attendanceId;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public String getStatus() {
        return status;
    }
}