package com.schoolapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student")
public class Student {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;


    // =========================================================
    // STUDENT DETAILS
    // =========================================================

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "admission_no")
    private String admissionNo;

    @Column(name = "roll_no")
    private String rollNo;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "mother_tongue")
    private String motherTongue;

    @Column(name = "religion")
    private String religion;

    @Column(name = "first_language")
    private String firstLanguage;

    @Column(name = "second_language")
    private String secondLanguage;

    @Column(name = "third_language")
    private String thirdLanguage;


    // =========================================================
    // CLASS DETAILS
    // =========================================================

    @Column(name = "class_name")
    private String className;

    @Column(name = "section")
    private String section;


    // =========================================================
    // ADDRESS DETAILS
    // =========================================================

    @Column(name = "current_address")
    private String currentAddress;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "city_pincode")
    private String cityPincode;


    // =========================================================
    // FATHER DETAILS
    // =========================================================

    @Column(name = "father_name")
    private String fatherName;

    @Column(name = "father_qualification")
    private String fatherQualification;

    @Column(name = "father_company")
    private String fatherCompany;

    @Column(name = "father_occupation")
    private String fatherOccupation;


    // =========================================================
    // MOTHER DETAILS
    // =========================================================

    @Column(name = "mother_name")
    private String motherName;

    @Column(name = "mother_qualification")
    private String motherQualification;

    @Column(name = "mother_company")
    private String motherCompany;

    @Column(name = "mother_occupation")
    private String motherOccupation;


    // =========================================================
    // PHOTO
    // =========================================================

    @Column(name = "student_photo")
    private String studentPhoto;


    // =========================================================
    // STATUS
    // =========================================================

    @Column(name = "status")
    private String status;


    // =========================================================
    // GETTERS
    // =========================================================

    public Integer getStudentId() {
        return studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getAdmissionNo() {
        return admissionNo;
    }

    public String getRollNo() {
        return rollNo;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public String getNationality() {
        return nationality;
    }

    public String getMotherTongue() {
        return motherTongue;
    }

    public String getReligion() {
        return religion;
    }

    public String getFirstLanguage() {
        return firstLanguage;
    }

    public String getSecondLanguage() {
        return secondLanguage;
    }

    public String getThirdLanguage() {
        return thirdLanguage;
    }

    public String getClassName() {
        return className;
    }

    public String getSection() {
        return section;
    }

    public String getCurrentAddress() {
        return currentAddress;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getCityPincode() {
        return cityPincode;
    }

    public String getFatherName() {
        return fatherName;
    }

    public String getFatherQualification() {
        return fatherQualification;
    }

    public String getFatherCompany() {
        return fatherCompany;
    }

    public String getFatherOccupation() {
        return fatherOccupation;
    }

    public String getMotherName() {
        return motherName;
    }

    public String getMotherQualification() {
        return motherQualification;
    }

    public String getMotherCompany() {
        return motherCompany;
    }

    public String getMotherOccupation() {
        return motherOccupation;
    }

    public String getStudentPhoto() {
        return studentPhoto;
    }

    public String getStatus() {
        return status;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setAdmissionNo(String admissionNo) {
        this.admissionNo = admissionNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public void setMotherTongue(String motherTongue) {
        this.motherTongue = motherTongue;
    }

    public void setReligion(String religion) {
        this.religion = religion;
    }

    public void setFirstLanguage(String firstLanguage) {
        this.firstLanguage = firstLanguage;
    }

    public void setSecondLanguage(String secondLanguage) {
        this.secondLanguage = secondLanguage;
    }

    public void setThirdLanguage(String thirdLanguage) {
        this.thirdLanguage = thirdLanguage;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public void setCurrentAddress(String currentAddress) {
        this.currentAddress = currentAddress;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setCityPincode(String cityPincode) {
        this.cityPincode = cityPincode;
    }

    public void setFatherName(String fatherName) {
        this.fatherName = fatherName;
    }

    public void setFatherQualification(String fatherQualification) {
        this.fatherQualification = fatherQualification;
    }

    public void setFatherCompany(String fatherCompany) {
        this.fatherCompany = fatherCompany;
    }

    public void setFatherOccupation(String fatherOccupation) {
        this.fatherOccupation = fatherOccupation;
    }

    public void setMotherName(String motherName) {
        this.motherName = motherName;
    }

    public void setMotherQualification(String motherQualification) {
        this.motherQualification = motherQualification;
    }

    public void setMotherCompany(String motherCompany) {
        this.motherCompany = motherCompany;
    }

    public void setMotherOccupation(String motherOccupation) {
        this.motherOccupation = motherOccupation;
    }

    public void setStudentPhoto(String studentPhoto) {
        this.studentPhoto = studentPhoto;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
