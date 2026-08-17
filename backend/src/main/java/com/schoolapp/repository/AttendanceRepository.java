package com.schoolapp.repository;

import com.schoolapp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    @Query(value = """
        SELECT COALESCE(
            ROUND(
                COUNT(*) FILTER (WHERE status = 'PRESENT') * 100.0 / NULLIF(COUNT(*), 0),
                1
            ),
            0
        )
        FROM attendance
        WHERE attendance_date = CURRENT_DATE
        """, nativeQuery = true)
    Double getTodayAttendancePercentage();

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    Optional<Attendance> findByStudentIdAndAttendanceDate(
            Integer studentId,
            LocalDate attendanceDate
    );
}
