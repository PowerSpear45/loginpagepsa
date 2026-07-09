package com.schoolapp.repository;

import com.schoolapp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    // ===== Existing Dashboard Method =====
    @Query(value = """
        SELECT IFNULL(
            ROUND(
                SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
                1
            ),
            0
        )
        FROM attendance
        WHERE attendance_date = CURDATE()
        """, nativeQuery = true)
    Double getTodayAttendancePercentage();


    // ===== Attendance Page Methods =====

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    Optional<Attendance> findByStudentIdAndAttendanceDate(
            Integer studentId,
            LocalDate attendanceDate
    );
}
