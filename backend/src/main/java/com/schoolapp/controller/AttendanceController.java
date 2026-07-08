package com.schoolapp.controller;

import com.schoolapp.entity.Attendance;
import com.schoolapp.repository.AttendanceRepository;
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
    public List<Attendance> getAttendance(@RequestParam String date) {

        LocalDate attendanceDate = LocalDate.parse(date);

        return attendanceRepository.findByAttendanceDate(attendanceDate);
    }

    @PostMapping("/save")
    public String saveAttendance(@RequestBody List<Attendance> attendanceList) {

        for (Attendance attendance : attendanceList) {

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

        return "Attendance Saved Successfully";
    }

}
