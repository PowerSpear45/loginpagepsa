package com.schoolapp.repository;

import com.schoolapp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

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
}
