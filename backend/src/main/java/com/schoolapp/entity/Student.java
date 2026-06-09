package com.schoolapp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "class_name")
    private String className;

    private String section;

    private String gender;

    private String status;

    @Column(name = "admission_no")
private String admissionNo;

@Column(name = "roll_no")
private String rollNo;

@Column(name = "date_of_birth")
private java.time.LocalDate dateOfBirth;

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

@Column(name = "current_address")
private String currentAddress;

@Column(name = "student_photo")
private String studentPhoto;

    public Integer getStudentId() {
        return studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getClassName() {
        return className;
    }

    public String getSection() {
        return section;
    }

    public String getGender() {
        return gender;
    }

    public String getStatus() {
        return status;
    }
    public void setStudentId(Integer studentId) {
    this.studentId = studentId;
}

public void setFullName(String fullName) {
    this.fullName = fullName;
}

public void setClassName(String className) {
    this.className = className;
}

public void setSection(String section) {
    this.section = section;
}

public void setGender(String gender) {
    this.gender = gender;
}

public void setStatus(String status) {
    this.status = status;
}

public void setAdmissionNo(String admissionNo) {
    this.admissionNo = admissionNo;
}

public void setRollNo(String rollNo) {
    this.rollNo = rollNo;
}

public void setDateOfBirth(java.time.LocalDate dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
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

public void setCurrentAddress(String currentAddress) {
    this.currentAddress = currentAddress;
}

public void setStudentPhoto(String studentPhoto) {
    this.studentPhoto = studentPhoto;
}
public String getAdmissionNo() {
    return admissionNo;
}

public String getRollNo() {
    return rollNo;
}

public java.time.LocalDate getDateOfBirth() {
    return dateOfBirth;
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

public String getCurrentAddress() {
    return currentAddress;
}

public String getStudentPhoto() {
    return studentPhoto;
}
}
