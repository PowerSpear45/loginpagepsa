package com.schoolapp.dto;

public class LeaveStatusUpdateDTO {
    private String status;
    private String teacherRemarks;

    public LeaveStatusUpdateDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTeacherRemarks() { return teacherRemarks; }
    public void setTeacherRemarks(String teacherRemarks) { this.teacherRemarks = teacherRemarks; }
}
