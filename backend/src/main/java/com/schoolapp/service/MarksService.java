package com.schoolapp.service;

import com.schoolapp.dto.MarksDTO;
import java.util.List;

public interface MarksService {

    List<MarksDTO> getAllMarks();

    MarksDTO getMarksByStudentId(Integer studentId);

    MarksDTO saveMarks(MarksDTO marksDTO);

    void deleteMarks(Integer studentId);

}
