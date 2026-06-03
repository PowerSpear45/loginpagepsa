package com.schoolapp.controller;

import com.schoolapp.dto.AdminDashboardDto;
import com.schoolapp.service.AdminDashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardDto getDashboard() {
        return adminDashboardService.getDashboardData();
    }
}
