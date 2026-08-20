package com.schoolapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_id")
    private Long leaveId;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "class_name", nullable = false, length = 20)
    private String className;

    @Column(nullable = false, length = 10)
    private String section;

    @Column(name = "leave_type", nullable = false, length = 100)
    private String leaveType;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Lob
    @Column(name = "attachment_data", columnDefinition = "LONGTEXT")
    private String attachmentData;

    @Column(length = 50)
    private String status = "Pending";

    @Column(name = "teacher_remarks")
    private String teacherRemarks;

    @Column(name = "applied_date", insertable = false, updatable = false)
    private LocalDateTime appliedDate;

    public LeaveRequest() {}

    public Long getLeaveId() { return leaveId; }
    public void setLeaveId(Long leaveId) { this.leaveId = leaveId; }

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public Integer getTotalDays() { return totalDays; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getAttachmentData() { return attachmentData; }
    public void setAttachmentData(String attachmentData) { this.attachmentData = attachmentData; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTeacherRemarks() { return teacherRemarks; }
    public void setTeacherRemarks(String teacherRemarks) { this.teacherRemarks = teacherRemarks; }

    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }
}
