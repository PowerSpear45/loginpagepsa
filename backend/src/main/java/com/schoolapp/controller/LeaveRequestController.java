package com.schoolapp.controller;

import com.schoolapp.dto.LeaveStatusUpdateDTO;
import com.schoolapp.entity.LeaveRequest;
import com.schoolapp.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getLeaves(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) Integer studentId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequests(className, section, studentId));
    }

    @PostMapping
    public ResponseEntity<LeaveRequest> applyLeave(@RequestBody LeaveRequest leaveRequest) {
        return ResponseEntity.ok(leaveRequestService.applyLeave(leaveRequest));
    }

    @PutMapping("/{leaveId}/status")
    public ResponseEntity<LeaveRequest> updateStatus(
            @PathVariable Long leaveId,
            @RequestBody LeaveStatusUpdateDTO updateDTO) {
        return leaveRequestService.updateLeaveStatus(leaveId, updateDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
