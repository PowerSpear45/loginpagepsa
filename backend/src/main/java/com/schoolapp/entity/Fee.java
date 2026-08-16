package com.schoolapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "fees")
public class Fee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeId;

    private String studentName;

    private String className;

    private String section;

    private String feeType;

    private LocalDate dueDate;

    private LocalDate paymentDate;

    private Double totalAmount;

    private Double paidAmount;

    public Fee() {
    }

    public Long getFeeId() {
        return feeId;
    }

    public void setFeeId(Long feeId) {
        this.feeId = feeId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    @Transient
    public Double getPendingAmount() {
        if (totalAmount == null) {
            return 0.0;
        }

        if (paidAmount == null) {
            return totalAmount;
        }

        return totalAmount - paidAmount;
    }

    @Transient
    public String getStatus() {

        if (paidAmount == null || paidAmount == 0) {
            return "Pending";
        }

        if (totalAmount != null && paidAmount.equals(totalAmount)) {
            return "Paid";
        }

        return "Partial";
    }
}