package com.schoolapp.repository;

import com.schoolapp.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByClassNameAndSectionOrderByLeaveIdDesc(String className, String section);
    List<LeaveRequest> findByStudentIdOrderByLeaveIdDesc(Integer studentId);
    List<LeaveRequest> findAllByOrderByLeaveIdDesc();
}
