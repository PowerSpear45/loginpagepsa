package com.schoolapp.controller;

import com.schoolapp.entity.Attendance;
import com.schoolapp.repository.AttendanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    /**
     * GET /api/attendance?date=YYYY-MM-DD
     * Fetches all attendance records recorded for the given date
     */
    @GetMapping
    public ResponseEntity<List<Attendance>> getAttendance(@RequestParam String date) {
        try {
            LocalDate attendanceDate = LocalDate.parse(date);
            List<Attendance> records = attendanceRepository.findByAttendanceDate(attendanceDate);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/attendance/save
     * Batch creates or updates attendance status for students
     */
    @PostMapping("/save")
    @Transactional
    public ResponseEntity<?> saveAttendance(@RequestBody List<Attendance> attendanceList) {
        if (attendanceList == null || attendanceList.isEmpty()) {
            return ResponseEntity.badRequest().body("Attendance list is empty");
        }

        try {
            for (Attendance attendance : attendanceList) {
                if (attendance.getStudentId() == null || attendance.getAttendanceDate() == null) {
                    continue;
                }

                // Query existing record via Optional<Attendance>
                Optional<Attendance> existingOpt = attendanceRepository
                        .findByStudentIdAndAttendanceDate(
                                attendance.getStudentId(),
                                attendance.getAttendanceDate()
                        );

                if (existingOpt.isPresent()) {
                    Attendance existing = existingOpt.get();
                    existing.setStatus(attendance.getStatus());
                    attendanceRepository.save(existing);
                } else {
                    attendanceRepository.save(attendance);
                }
            }
            return ResponseEntity.ok("Attendance Saved Successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error saving: " + e.getMessage());
        }
    }
}
