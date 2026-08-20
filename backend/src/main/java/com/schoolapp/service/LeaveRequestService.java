package com.schoolapp.service;

import com.schoolapp.dto.LeaveStatusUpdateDTO;
import com.schoolapp.entity.LeaveRequest;
import com.schoolapp.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    public List<LeaveRequest> getLeaveRequests(String className, String section, Integer studentId) {
        if (className != null && section != null) {
            return leaveRequestRepository.findByClassNameAndSectionOrderByLeaveIdDesc(className, section);
        } else if (studentId != null) {
            return leaveRequestRepository.findByStudentIdOrderByLeaveIdDesc(studentId);
        }
        return leaveRequestRepository.findAllByOrderByLeaveIdDesc();
    }

    public LeaveRequest applyLeave(LeaveRequest request) {
        request.setStatus("Pending");
        return leaveRequestRepository.save(request);
    }

    public Optional<LeaveRequest> updateLeaveStatus(Long leaveId, LeaveStatusUpdateDTO dto) {
        return leaveRequestRepository.findById(leaveId).map(leave -> {
            leave.setStatus(dto.getStatus());
            leave.setTeacherRemarks(dto.getTeacherRemarks());
            return leaveRequestRepository.save(leave);
        });
    }
}