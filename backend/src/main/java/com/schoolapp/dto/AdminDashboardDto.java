package com.schoolapp.dto;

import com.schoolapp.entity.ActivityLog;
import java.util.List;

public class AdminDashboardDto {

    private long totalStudents;
    private long totalTeachers;
    private Double attendancePercentage;
    private List<ActivityLog> recentActivities;

    public AdminDashboardDto(
            long totalStudents,
            long totalTeachers,
            Double attendancePercentage,
            List<ActivityLog> recentActivities) {

        this.totalStudents = totalStudents;
        this.totalTeachers = totalTeachers;
        this.attendancePercentage = attendancePercentage;
        this.recentActivities = recentActivities;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getTotalTeachers() {
        return totalTeachers;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public List<ActivityLog> getRecentActivities() {
        return recentActivities;
    }
}
