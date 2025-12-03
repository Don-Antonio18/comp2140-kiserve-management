package com.kiserve.dto;

/**
 * Simple DTO (data transfer object) that represents the key numbers and
 * high-level summary
 * information displayed on the dashboard.
 */
public class DashboardDTO {

    private Long totalProjects;
    private Long activeProjects;
    private Long completedProjects;
    private Long upcomingMilestones;
    private Long overdueMilestones;
    private Long unreadNotifications;
    private Long recentReportsCount;

    public DashboardDTO() {
    }

    public Long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(Long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public Long getActiveProjects() {
        return activeProjects;
    }

    public void setActiveProjects(Long activeProjects) {
        this.activeProjects = activeProjects;
    }

    public Long getCompletedProjects() {
        return completedProjects;
    }

    public void setCompletedProjects(Long completedProjects) {
        this.completedProjects = completedProjects;
    }

    public Long getUpcomingMilestones() {
        return upcomingMilestones;
    }

    public void setUpcomingMilestones(Long upcomingMilestones) {
        this.upcomingMilestones = upcomingMilestones;
    }

    public Long getOverdueMilestones() {
        return overdueMilestones;
    }

    public void setOverdueMilestones(Long overdueMilestones) {
        this.overdueMilestones = overdueMilestones;
    }

    public Long getUnreadNotifications() {
        return unreadNotifications;
    }

    public void setUnreadNotifications(Long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }

    public Long getRecentReportsCount() {
        return recentReportsCount;
    }

    public void setRecentReportsCount(Long recentReportsCount) {
        this.recentReportsCount = recentReportsCount;
    }
}
