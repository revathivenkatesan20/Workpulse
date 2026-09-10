package com.workpulse.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class EODTask {

    private String description;

    private String status;

    private String remarks;

    public EODTask() {
    }

    public EODTask(String description, String status, String remarks) {
        this.description = description;
        this.status = status;
        this.remarks = remarks;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}