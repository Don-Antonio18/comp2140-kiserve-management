package com.kiserve.controllers;

import com.kiserve.dto.DashboardDTO;
import com.kiserve.models.Dashboard;
import com.kiserve.models.DashboardSummary;
import com.kiserve.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DashboardController handles authentication and dashboard requests.
 * Serves both Thymeleaf views and JSON REST responses.
 */
@Controller
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // ========== AUTH ENDPOINTS ==========

    /**
     * GET /auth/login
     * Serve the login form.
     */
    @GetMapping("/auth/login")
    public String loginPage() {
        return "auth/login";
    }

    /**
     * POST /auth/login
     * Handle login form submission.
     * Spring Security intercepts this; on success, redirect to /dashboard.
     * On failure, redirect back to login with error parameter.
     */
    @PostMapping("/auth/login")
    public String login() {
        // Spring Security handles authentication here.
        // If valid, redirect to dashboard; if invalid, redirect back to
        // login?error=true
        return "redirect:/dashboard";
    }

    /**
     * GET /auth/logout
     * Handle logout.
     */
    @GetMapping("/auth/logout")
    public String logout() {
        return "redirect:/auth/login?logout=true";
    }

    // ========== DASHBOARD ENDPOINTS ==========

    /**
     * GET /dashboard
     * Render the main dashboard Thymeleaf view with summary metrics.
     */
    @GetMapping("/dashboard")
    public String getDashboard(Model model) {
        DashboardDTO dashboardDTO = dashboardService.getDashboardSummary();
        model.addAttribute("dashboard", dashboardDTO);
        return "dashboard/dashboard";
    }

    /**
     * GET /api/dashboard/summary
     * Return high-level analytics summary (JSON).
     * Optional filters: committee, startDate, endDate
     */
    @GetMapping("/api/dashboard/summary")
    @ResponseBody
    public DashboardSummary getSummary(
            @RequestParam(required = false) String committee,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return dashboardService.getDashboardSummary(committee, startDate, endDate);
    }

    /**
     * GET /api/dashboard/chart
     * Return time-series chart data (JSON).
     * Optional filters: startDate, endDate, committee
     */
    @GetMapping("/api/dashboard/chart")
    @ResponseBody
    public List<Map<String, Object>> getChartData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String committee) {
        return dashboardService.getChartData(startDate, endDate, committee);
    }

    /**
     * GET /api/dashboard/personalized
     * Return a user's personalized Dashboard object with filtered/sorted widgets.
     * filters: status, tag, committee
     */
    @GetMapping("/api/dashboard/personalized")
    @ResponseBody
    public Dashboard getPersonalizedDashboard(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String committee,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Dashboard dashboard = new Dashboard();
        // Filter widgets based on parameters
        List<Map<String, Object>> filtered = dashboard.filterDashboard(startDate, endDate, status, tag, committee);
        dashboard.setWidgets(filtered);
        return dashboard;
    }
}