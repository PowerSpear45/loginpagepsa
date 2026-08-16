package com.schoolapp.service;

import com.schoolapp.entity.Fee;
import com.schoolapp.repository.FeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FeeService {

    private final FeeRepository feeRepository;

    public FeeService(FeeRepository feeRepository) {
        this.feeRepository = feeRepository;
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public Fee getFeeById(Long id) {
        return feeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Fee record not found with id: " + id));
    }

    public Fee addFee(Fee fee) {
        return feeRepository.save(fee);
    }

    public Fee updateFee(Long id, Fee updatedFee) {

        Fee existingFee = getFeeById(id);

        existingFee.setStudentName(updatedFee.getStudentName());
        existingFee.setClassName(updatedFee.getClassName());
        existingFee.setSection(updatedFee.getSection());
        existingFee.setFeeType(updatedFee.getFeeType());
        existingFee.setDueDate(updatedFee.getDueDate());
        existingFee.setPaymentDate(updatedFee.getPaymentDate());
        existingFee.setTotalAmount(updatedFee.getTotalAmount());
        existingFee.setPaidAmount(updatedFee.getPaidAmount());

        return feeRepository.save(existingFee);
    }

    public void deleteFee(Long id) {
        feeRepository.deleteById(id);
    }

    public Fee collectPayment(
            Long id,
            Double amount,
            LocalDate paymentDate) {

        Fee fee = getFeeById(id);

        double currentPaid =
                fee.getPaidAmount() == null
                        ? 0
                        : fee.getPaidAmount();

        double total =
                fee.getTotalAmount() == null
                        ? 0
                        : fee.getTotalAmount();

        if (amount == null || amount <= 0) {
            throw new RuntimeException(
                    "Amount must be greater than 0");
        }

        if (paymentDate == null) {
            throw new RuntimeException(
                    "Payment date is required");
        }

        double newPaidAmount = currentPaid + amount;

        if (newPaidAmount > total) {
            throw new RuntimeException(
                    "Paid amount cannot be greater than total amount");
        }

        fee.setPaidAmount(newPaidAmount);

        // Save the date on which the payment was received
        fee.setPaymentDate(paymentDate);

        return feeRepository.save(fee);
    }
}