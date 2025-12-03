package com.kiserve.services;

import com.kiserve.dto.DashboardDTO;
import com.kiserve.models.DashboardSummary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service responsible for assembling high-level dashboard metrics and data
 * for the main dashboard view.
 */
@Service
public class DashboardService {

    /**
     * Build a summary of key information to display on the main dashboard
     * Thymeleaf view.
     */
    public DashboardDTO getDashboardSummary() {
        DashboardDTO dto = new DashboardDTO();

        // Placeholder values for now. Replace with real data later.
        dto.setTotalProjects(1L);
        dto.setActiveProjects(2L);
        dto.setCompletedProjects(3L);
        dto.setUpcomingMilestones(4L);
        dto.setOverdueMilestones(5L);
        dto.setUnreadNotifications(6L);
        dto.setRecentReportsCount(7L);

        return dto;
    }

    /**
     * Build a higher-level analytics summary for API consumers.
     * This currently returns static placeholder data; later, it can
     * use filters such as committee and date range.
     */
    public DashboardSummary getDashboardSummary(String committee, LocalDate startDate, LocalDate endDate) {
        DashboardSummary summary = new DashboardSummary();

        // Placeholder values; plug in repository-based calculations later.
        summary.setTotalProjects(0L);
        summary.setTotalBeneficiaries(0L);
        summary.setTotalVolunteerHours(0.0);
        summary.setProjectValue(0.0);
        summary.setLastUpdated(java.time.LocalDateTime.now().toString());

        return summary;
    }

    /**
     * Return time-series chart data for the dashboard.
     * Currently returns placeholder monthly points; replace with repository
     * queries.
     */
    public List<Map<String, Object>> getChartData(LocalDate startDate, LocalDate endDate, String committee) {
        List<Map<String, Object>> series = new ArrayList<>();
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : end.minusMonths(5);

        DateTimeFormatter fmt = DateTimeFormatter.ISO_DATE;
        LocalDate d = start;
        Random rnd = new Random(1);

        while (!d.isAfter(end)) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", d.format(fmt));
            // placeholders: projectsCount, hours, value
            point.put("projects", 1 + rnd.nextInt(10));
            point.put("hours", Math.round((50 + rnd.nextDouble() * 200) * 10.0) / 10.0);
            point.put("value", Math.round((1000 + rnd.nextDouble() * 20000) * 100.0) / 100.0);
            series.add(point);
            d = d.plusWeeks(2); // sample cadence
        }
        return series;
    }
}
