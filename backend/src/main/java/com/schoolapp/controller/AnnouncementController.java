package com.schoolapp.controller;

import com.schoolapp.entity.Announcement;
import com.schoolapp.repository.AnnouncementRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @GetMapping
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    @PostMapping
    public Announcement addAnnouncement(@RequestBody Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    @PutMapping("/{id}")
    public Announcement updateAnnouncement(
            @PathVariable Long id,
            @RequestBody Announcement updatedAnnouncement
    ) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        announcement.setTitle(updatedAnnouncement.getTitle());
        announcement.setDescription(updatedAnnouncement.getDescription());
        announcement.setAudience(updatedAnnouncement.getAudience());
        announcement.setPostedBy(updatedAnnouncement.getPostedBy());
        announcement.setStatus(updatedAnnouncement.getStatus());
        announcement.setDate(updatedAnnouncement.getDate());
        announcement.setTime(updatedAnnouncement.getTime());

        return announcementRepository.save(announcement);
    }

    @DeleteMapping("/{id}")
    public String deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return "Announcement deleted successfully";
    }
}