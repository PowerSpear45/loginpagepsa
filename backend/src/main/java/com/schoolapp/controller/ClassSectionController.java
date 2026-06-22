package com.schoolapp.controller;

import com.schoolapp.entity.ClassSection;
import com.schoolapp.repository.ClassSectionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/class-sections")
@CrossOrigin(origins = "*")
public class ClassSectionController {

    private final ClassSectionRepository repository;

    public ClassSectionController(ClassSectionRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ClassSection> getAllClassSections() {
        return repository.findAll();
    }

    @PostMapping
    public ClassSection addClassSection(@RequestBody ClassSection classSection) {
        return repository.save(classSection);
    }

    @PutMapping("/{id}")
    public ClassSection updateClassSection(@PathVariable Long id, @RequestBody ClassSection updated) {
        ClassSection existing = repository.findById(id).orElseThrow();

        existing.setClassName(updated.getClassName());
        existing.setSection(updated.getSection());
        existing.setStrength(updated.getStrength());
        existing.setClassTeacher(updated.getClassTeacher());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteClassSection(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
