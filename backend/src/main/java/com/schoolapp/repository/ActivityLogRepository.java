package com.schoolapp.repository;

import com.schoolapp.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Integer> {
    List<ActivityLog> findTop3ByOrderByActivityIdDesc();
}
