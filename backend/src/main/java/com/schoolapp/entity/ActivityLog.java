package com.schoolapp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "activity_log")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_id")
    private Integer activityId;

    @Column(name = "activity_title")
    private String activityTitle;

    @Column(name = "done_by")
    private String doneBy;

    @Column(name = "activity_time")
    private String activityTime;

    @Column(name = "icon_type")
    private String iconType;

    public Integer getActivityId() {
        return activityId;
    }

    public String getActivityTitle() {
        return activityTitle;
    }

    public String getDoneBy() {
        return doneBy;
    }

    public String getActivityTime() {
        return activityTime;
    }

    public String getIconType() {
        return iconType;
    }
}