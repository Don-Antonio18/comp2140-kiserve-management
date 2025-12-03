package com.kiserve.models;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dashboard model representing a user's personalized dashboard.
 * Contains placeholder widget data; replace data source calls with real
 * repository/service queries when available.
 */
public class Dashboard implements Serializable {
    private int dashboardID;
    private String userID;
    private String layout;

    // Each widget is a map describing a graphical item (progress, hours, value,
    // beneficiaries, etc.)
    private List<Map<String, Object>> widgets = new ArrayList<>();

    public Dashboard() {
        // generate placeholder widgets
        this.generatePlaceholderWidgets();
    }

    public Dashboard(int dashboardID, String userID, String layout) {
        this.dashboardID = dashboardID;
        this.userID = userID;
        this.layout = layout;
        this.generatePlaceholderWidgets();
    }

    // Getters / Setters
    public int getDashboardID() {
        return dashboardID;
    }

    public void setDashboardID(int dashboardID) {
        this.dashboardID = dashboardID;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public List<Map<String, Object>> getWidgets() {
        return widgets;
    }

    public void setWidgets(List<Map<String, Object>> widgets) {
        this.widgets = widgets;
    }

    /**
     * Sort widgets in-place by a given key found in each widget map.
     * Supported value types: Comparable (Number, String, LocalDate).
     *
     * @param key       map key to sort by (e.g. "progress", "hours", "value",
     *                  "date")
     * @param ascending true for ascending, false for descending
     */
    public void sortDashboard(String key, boolean ascending) {
        Comparator<Map<String, Object>> cmp = (a, b) -> {
            Object va = a.get(key);
            Object vb = b.get(key);
            if (va == null && vb == null)
                return 0;
            if (va == null)
                return -1;
            if (vb == null)
                return 1;
            if (va instanceof Comparable && vb instanceof Comparable) {
                @SuppressWarnings("unchecked")
                Comparable<Object> ca = (Comparable<Object>) va;
                return ca.compareTo(vb);
            }
            return 0;
        };

        if (!ascending) {
            cmp = cmp.reversed();
        }

        widgets.sort(cmp);
    }

    /**
     * Filter widgets according to supplied filters. Any null filter is ignored.
     *
     * @param startDate start of date range (inclusive) or null
     * @param endDate   end of date range (inclusive) or null
     * @param status    status to match (e.g. "active", "completed") or null
     * @param tag       tag to match (matches any widget containing the tag) or null
     * @param committee committee to match or null
     * @return filtered list (does not modify the internal widgets list)
     */
    public List<Map<String, Object>> filterDashboard(LocalDate startDate,
            LocalDate endDate,
            String status,
            String tag,
            String committee) {
        return widgets.stream()
                .filter(w -> {
                    // date filter
                    if (startDate != null || endDate != null) {
                        LocalDate date = (LocalDate) w.get("date");
                        if (date == null)
                            return false;
                        if (startDate != null && date.isBefore(startDate))
                            return false;
                        if (endDate != null && date.isAfter(endDate))
                            return false;
                    }
                    // status
                    if (status != null) {
                        Object s = w.get("status");
                        if (s == null || !status.equalsIgnoreCase(s.toString()))
                            return false;
                    }
                    // tag
                    if (tag != null) {
                        Object tagsObj = w.get("tags");
                        if (!(tagsObj instanceof Collection))
                            return false;
                        @SuppressWarnings("unchecked")
                        Collection<String> tags = (Collection<String>) tagsObj;
                        boolean found = tags.stream().anyMatch(t -> t.equalsIgnoreCase(tag));
                        if (!found)
                            return false;
                    }
                    // committee
                    if (committee != null) {
                        Object c = w.get("committee");
                        if (c == null || !committee.equalsIgnoreCase(c.toString()))
                            return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    // --- Placeholder data --- replace with real data-loading when available ---
    private void generatePlaceholderWidgets() {
        widgets.clear();

        widgets.add(widget("Project Alpha", LocalDate.now().minusDays(10), "active",
                76.5, 120.0, 15000.0, 120, Arrays.asList("infrastructure", "priorityA"), "Committee A"));

        widgets.add(widget("Project Beta", LocalDate.now().minusDays(40), "completed",
                100.0, 500.0, 50000.0, 500, Arrays.asList("education"), "Committee B"));

        widgets.add(widget("Project Gamma", LocalDate.now().plusDays(5), "upcoming",
                0.0, 0.0, 0.0, 0, Arrays.asList("health", "priorityB"), "Committee A"));

        widgets.add(widget("Project Delta", LocalDate.now().minusDays(3), "active",
                45.0, 35.0, 8000.0, 60, Arrays.asList("community"), "Committee C"));
    }

    private Map<String, Object> widget(String title,
            LocalDate date,
            String status,
            double progressPercent,
            double hours,
            double value,
            int beneficiaries,
            List<String> tags,
            String committee) {
        Map<String, Object> m = new HashMap<>();
        m.put("title", title);
        m.put("date", date);
        m.put("status", status);
        m.put("progress", progressPercent); // 0-100
        m.put("hours", hours);
        m.put("value", value);
        m.put("beneficiaries", beneficiaries);
        m.put("tags", tags);
        m.put("committee", committee);
        return m;
    }
}