package com.workpulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "eod_tasks")
public class EODTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private String status;

    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eod_report_id", nullable = false)
    @JsonIgnore
    private EODReport eodReport;

    public EODTask() {
    }

    public EODTask(
            String description,
            String status,
            String remarks
    ) {
        this.description = description;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getId() {
        return id;
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

    public EODReport getEodReport() {
        return eodReport;
    }

    public void setEodReport(EODReport eodReport) {
        this.eodReport = eodReport;
    }
}