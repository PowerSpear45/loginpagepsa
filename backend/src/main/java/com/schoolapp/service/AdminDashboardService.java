package com.schoolapp.service;

import com.schoolapp.dto.AdminDashboardDto;
import com.schoolapp.entity.ActivityLog;
import com.schoolapp.repository.ActivityLogRepository;
import com.schoolapp.repository.AttendanceRepository;
import com.schoolapp.repository.StudentRepository;
import com.schoolapp.repository.TeacherRepository;

import org.springframework.stereotype.Service;

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

        long totalStudents = studentRepository.countByStatus("ACTIVE");

        long totalTeachers = teacherRepository.countByStatus("ACTIVE");

        Double attendancePercentage =
                attendanceRepository.getTodayAttendancePercentage();

        if (attendancePercentage == null) {
            attendancePercentage = 0.0;
        }

        List<ActivityLog> activities =
                activityLogRepository.findTop3ByOrderByActivityIdDesc();

        return new AdminDashboardDto(
                totalStudents,
                totalTeachers,
                attendancePercentage,
                activities
        );
    }
}
