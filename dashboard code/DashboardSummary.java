package com.kiserve.models;

/**
 * DTO (Data Transfer Object) for dashboard summary
 * Used to send clean, read-only dashboard data to the UI
 */
public class DashboardSummary {

    private long totalProjects;
    private long totalBeneficiaries;
    private double totalVolunteerHours;
    private double projectValue;
    private String lastUpdated;

    // Constructors
    public DashboardSummary() {
    }

    public DashboardSummary(long totalProjects, long totalBeneficiaries,
            double totalVolunteerHours, double projectValue) {
        this.totalProjects = totalProjects;
        this.totalBeneficiaries = totalBeneficiaries;
        this.totalVolunteerHours = totalVolunteerHours;
        this.projectValue = projectValue;
        this.lastUpdated = java.time.LocalDateTime.now().toString();
    }

    // Getters & Setters
    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getTotalBeneficiaries() {
        return totalBeneficiaries;
    }

    public void setTotalBeneficiaries(long totalBeneficiaries) {
        this.totalBeneficiaries = totalBeneficiaries;
    }

    public double getTotalVolunteerHours() {
        return totalVolunteerHours;
    }

    public void setTotalVolunteerHours(double totalVolunteerHours) {
        this.totalVolunteerHours = totalVolunteerHours;
    }

    public double getProjectValue() {
        return projectValue;
    }

    public void setProjectValue(double projectValue) {
        this.projectValue = projectValue;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
