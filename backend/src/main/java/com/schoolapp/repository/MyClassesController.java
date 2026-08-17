```java
package com.schoolapp.controller;

import com.schoolapp.entity.ClassSection;
import com.schoolapp.repository.ClassSectionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class MyClassesController {

    private final ClassSectionRepository classSectionRepository;

    public MyClassesController(ClassSectionRepository classSectionRepository) {
        this.classSectionRepository = classSectionRepository;
    }

    @GetMapping("/{teacherId}/classes")
    public List<ClassSection> getTeacherClasses(
            @PathVariable Integer teacherId) {

        return classSectionRepository.findByClassTeacher(teacherId);
    }
}
```

