package com.schoolapp.controller;

import com.schoolapp.entity.Attendance;
import com.schoolapp.repository.AttendanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAttendance(@RequestParam String date) {
        try {
            LocalDate attendanceDate = LocalDate.parse(date);
            return ResponseEntity.ok(attendanceRepository.findByAttendanceDate(attendanceDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

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

                Attendance existing = attendanceRepository
                        .findByStudentIdAndAttendanceDate(
                                attendance.getStudentId(),
                                attendance.getAttendanceDate()
                        )
                        .orElse(null);

                if (existing != null) {
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
