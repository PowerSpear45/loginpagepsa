package com.schoolapp.service;

import com.schoolapp.dto.AdminDashboardDto;
import com.schoolapp.entity.ActivityLog;
import com.schoolapp.repository.ActivityLogRepository;
import com.schoolapp.repository.AttendanceRepository;
import com.schoolapp.repository.StudentRepository;
import com.schoolapp.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminDashboardService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRepository attendanceRepository;
    private final ActivityLogRepository activityLogRepository;

    public AdminDashboardService(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            AttendanceRepository attendanceRepository,
            ActivityLogRepository activityLogRepository) {

        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.attendanceRepository = attendanceRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public AdminDashboardDto getDashboardData() {

        // 1. Total Students Count (Fallback to total count if status filtering returns 0)
        long totalStudents = 0;
        try {
            totalStudents = studentRepository.count();
            if (totalStudents == 0) {
                totalStudents = studentRepository.count();
            }
        } catch (Exception e) {
            totalStudents = studentRepository.count();
        }

        // 2. Total Teachers Count (Fallback to total count if status filtering returns 0)
        long totalTeachers = 0;
        try {
            totalTeachers = teacherRepository.count();
            if (totalTeachers == 0) {
                totalTeachers = teacherRepository.count();
            }
        } catch (Exception e) {
            totalTeachers = teacherRepository.count();
        }

        // 3. Attendance Calculation
        Double attendancePercentage = null;
        try {
            attendancePercentage = attendanceRepository.getTodayAttendancePercentage();
        } catch (Exception e) {
            attendancePercentage = 0.0;
        }

        if (attendancePercentage == null || attendancePercentage.isNaN()) {
            attendancePercentage = 0.0;
        }

        // Round to 1 decimal place
        attendancePercentage = Math.round(attendancePercentage * 10.0) / 10.0;

        // 4. Activity Logs (Safely fetch top 3 or return empty list)
        List<ActivityLog> activities = new ArrayList<>();
        try {
            activities = activityLogRepository.findTop3ByOrderByActivityIdDesc();
            if (activities == null) {
                activities = new ArrayList<>();
            }
        } catch (Exception e) {
            activities = new ArrayList<>();
        }

        return new AdminDashboardDto(
                totalStudents,
                totalTeachers,
                attendancePercentage,
                activities
        );
    }
}
