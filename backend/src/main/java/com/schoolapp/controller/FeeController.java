package com.schoolapp.controller;

import com.schoolapp.entity.Fee;
import com.schoolapp.service.FeeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "*")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public List<Fee> getAllFees() {
        return feeService.getAllFees();
    }

    @GetMapping("/{id}")
    public Fee getFeeById(@PathVariable Long id) {
        return feeService.getFeeById(id);
    }

    @PostMapping
    public Fee addFee(@RequestBody Fee fee) {
        return feeService.addFee(fee);
    }

    @PutMapping("/{id}")
    public Fee updateFee(@PathVariable Long id, @RequestBody Fee fee) {
        return feeService.updateFee(id, fee);
    }

    @DeleteMapping("/{id}")
    public String deleteFee(@PathVariable Long id) {
        feeService.deleteFee(id);
        return "Fee record deleted successfully";
    }

    @PutMapping("/{id}/collect")
    public Fee collectPayment(@PathVariable Long id, @RequestBody Map<String, Double> request) {
        Double amount = request.get("amount");
        return feeService.collectPayment(id, amount);
    }
}