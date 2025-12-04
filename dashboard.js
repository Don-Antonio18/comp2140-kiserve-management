const STORAGE_KEY = "myProjects";
const MILESTONE_KEY = "myMilestones";

let allProjects = [];
let allMilestones = [];
let chartInstances = {};
let filteredProjects = [];

document.addEventListener("DOMContentLoaded", function () {
	loadData();
	populateFilterDropdowns();
	attachFilterListeners();
});

/**
 * Load projects and milestones from localStorage
 */
function loadData() {
	try {
		const projectsRaw = localStorage.getItem(STORAGE_KEY);
		allProjects = projectsRaw ? JSON.parse(projectsRaw) : [];

		const milestonesRaw = localStorage.getItem(MILESTONE_KEY);
		allMilestones = milestonesRaw ? JSON.parse(milestonesRaw) : [];

		filteredProjects = [...allProjects];

		updateSummaryCards();
		renderCharts();
	} catch (err) {
		console.error("Error loading data:", err);
		allProjects = [];
		allMilestones = [];
	}
}

/**
 * Update summary cards with project statistics
 */
function updateSummaryCards() {
	const totalProjects = filteredProjects.length;
	const activeProjects = filteredProjects.filter(
		(p) => p.status === "active"
	).length;
	const completedProjects = filteredProjects.filter(
		(p) => p.status === "completed"
	).length;
	const totalMilestones = allMilestones.length;
	const completedMilestones = allMilestones.filter((m) => m.completed).length;

	document.getElementById("totalProjects").textContent = totalProjects;
	document.getElementById("activeProjects").textContent = activeProjects;
	document.getElementById("completedProjects").textContent = completedProjects;
	document.getElementById("totalMilestones").textContent = totalMilestones;
	document.getElementById("completedMilestones").textContent =
		completedMilestones;
}

/**
 * add filters based on project details
 */
function populateFilterDropdowns() {
	// Get unique tags
	const tags = new Set();
	allProjects.forEach((p) => {
		if (p.tag) tags.add(p.tag);
	});

	const tagSelect = document.getElementById("filterTag");
	tagSelect.innerHTML = '<option value="">-- All --</option>';
	Array.from(tags)
		.sort()
		.forEach((tag) => {
			tagSelect.innerHTML += `<option value="${escapeHtml(tag)}">${escapeHtml(
				tag
			)}</option>`;
		});
}

/**
 * event listeners to filter/sort controls
 */
function attachFilterListeners() {
	document
		.getElementById("applyFiltersBtn")
		.addEventListener("click", applyFilters);
	document
		.getElementById("resetFiltersBtn")
		.addEventListener("click", resetFilters);
}

/**
 * filters and sorting based on control values
 */
function applyFilters() {
	const status = document.getElementById("filterStatus").value;
	const tag = document.getElementById("filterTag").value;
	const sortBy = document.getElementById("sortBy").value;
	const sortOrder = document.getElementById("sortOrder").value;

	// Filter projects
	filteredProjects = allProjects.filter((project) => {
		if (status && project.status !== status) return false;
		if (tag && project.tag !== tag) return false;
		return true;
	});

	// Sort projects
	filteredProjects.sort((a, b) => {
		let aVal = a[sortBy];
		let bVal = b[sortBy];

		// Handle null/undefined values
		if (aVal == null) aVal = "";
		if (bVal == null) bVal = "";

		// Handle numbers
		if (typeof aVal === "number" && typeof bVal === "number") {
			return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
		}

		// Handle strings/dates
		const comparison = String(aVal).localeCompare(String(bVal));
		return sortOrder === "asc" ? comparison : -comparison;
	});

	updateSummaryCards();
	renderCharts();
}

/**
 * Reset filters and reload all data
 */
function resetFilters() {
	document.getElementById("filterStatus").value = "";
	document.getElementById("filterTag").value = "";
	document.getElementById("sortBy").value = "name";
	document.getElementById("sortOrder").value = "asc";

	filteredProjects = [...allProjects];
	updateSummaryCards();
	renderCharts();
}

/**
 * Render all charts
 */
function renderCharts() {
	renderTimeSeriesChart();
	renderTagDistributionChart();
	renderStatusDistributionChart();
	renderCommitteeChart();
	renderHoursVsImpactChart();
	renderTotalHoursChart();
}

/**
 * Time-series chart: Projects over time
 */
function renderTimeSeriesChart() {
	const projectsByMonth = {};

	filteredProjects.forEach((project) => {
		const date = project.startDate || project.dueDate;
		if (date) {
			const monthKey = date.substring(0, 7); // YYYY-MM
			projectsByMonth[monthKey] = (projectsByMonth[monthKey] || 0) + 1;
		}
	});

	const labels = Object.keys(projectsByMonth).sort();
	const data = labels.map((label) => projectsByMonth[label]);

	destroyChart("timeSeriesChart");
	const ctx = document.getElementById("timeSeriesChart").getContext("2d");
	chartInstances.timeSeriesChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Projects Started/Due",
					data: data,
					borderColor: "rgba(102, 126, 234, 1)",
					backgroundColor: "rgba(102, 126, 234, 0.1)",
					fill: true,
					tension: 0.4,
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				y: { beginAtZero: true },
			},
		},
	});
}

/**
 * Bar chart: Tag distribution
 */
function renderTagDistributionChart() {
	const tagCounts = {};

	filteredProjects.forEach((project) => {
		const tag = project.tag || "No Tag";
		tagCounts[tag] = (tagCounts[tag] || 0) + 1;
	});

	const labels = Object.keys(tagCounts);
	const data = Object.values(tagCounts);
	const colors = generateColors(labels.length);

	destroyChart("tagDistributionChart");
	const ctx = document.getElementById("tagDistributionChart").getContext("2d");
	chartInstances.tagDistributionChart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Number of Projects",
					data: data,
					backgroundColor: colors,
					borderColor: colors.map((c) => c.replace("0.6", "1")),
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			scales: { y: { beginAtZero: true } },
		},
	});
}

/**
 * Pie chart: Project status distribution
 */
function renderStatusDistributionChart() {
	const statusCounts = {};

	filteredProjects.forEach((project) => {
		const status = project.status || "unknown";
		statusCounts[status] = (statusCounts[status] || 0) + 1;
	});

	const labels = Object.keys(statusCounts);
	const data = Object.values(statusCounts);
	const colors = generateColors(labels.length);

	destroyChart("statusDistributionChart");
	const ctx = document
		.getElementById("statusDistributionChart")
		.getContext("2d");
	chartInstances.statusDistributionChart = new Chart(ctx, {
		type: "pie",
		data: {
			labels: labels,
			datasets: [
				{
					data: data,
					backgroundColor: colors,
					borderColor: colors.map((c) => c.replace("0.6", "1")),
					borderWidth: 1,
				},
			],
		},
		options: { responsive: true },
	});
}

/**
 * Bar chart: Projects by committee
 */
function renderCommitteeChart() {
	const committeeCounts = {};

	filteredProjects.forEach((project) => {
		const committee = project.committee || "Unassigned";
		committeeCounts[committee] = (committeeCounts[committee] || 0) + 1;
	});

	const labels = Object.keys(committeeCounts);
	const data = Object.values(committeeCounts);
	const colors = generateColors(labels.length);

	destroyChart("committeeChart");
	const ctx = document.getElementById("committeeChart").getContext("2d");
	chartInstances.committeeChart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Project Count",
					data: data,
					backgroundColor: colors,
					borderColor: colors.map((c) => c.replace("0.6", "1")),
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			scales: { y: { beginAtZero: true } },
		},
	});
}

/**
 * Scatter chart: Hours vs People Impacted
 */
function renderHoursVsImpactChart() {
	const data = filteredProjects
		.map((project) => {
			const totalHours =
				(project.hoursPlanning || 0) + (project.hoursExecuting || 0);
			return {
				x: totalHours,
				y: project.peopleImpacted || 0,
				label: project.name,
			};
		})
		.filter((point) => point.x > 0 || point.y > 0);

	destroyChart("hoursVsImpactChart");
	const ctx = document.getElementById("hoursVsImpactChart").getContext("2d");
	chartInstances.hoursVsImpactChart = new Chart(ctx, {
		type: "scatter",
		data: {
			datasets: [
				{
					label: "Projects",
					data: data,
					backgroundColor: "rgba(102, 126, 234, 0.6)",
					borderColor: "rgba(102, 126, 234, 1)",
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				x: {
					title: { display: true, text: "Total Hours" },
					beginAtZero: true,
				},
				y: {
					title: { display: true, text: "People Impacted" },
					beginAtZero: true,
				},
			},
			plugins: {
				tooltip: {
					callbacks: {
						label: function (context) {
							const point = context.raw;
							return `${point.label || "Project"}: ${point.x}h, ${
								point.y
							} people`;
						},
					},
				},
			},
		},
	});
}

/**
 * bar chart showing total hours by project
 */
function renderTotalHoursChart() {
	const projectData = filteredProjects
		.map((project) => ({
			name: project.name,
			hours: (project.hoursPlanning || 0) + (project.hoursExecuting || 0),
		}))
		.filter((p) => p.hours > 0)
		.sort((a, b) => b.hours - a.hours)
		.slice(0, 10); // Top 10 projects

	const labels = projectData.map((p) => p.name);
	const data = projectData.map((p) => p.hours);
	const colors = generateColors(labels.length);

	destroyChart("totalHoursChart");
	const ctx = document.getElementById("totalHoursChart").getContext("2d");
	chartInstances.totalHoursChart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Total Hours",
					data: data,
					backgroundColor: colors,
					borderColor: colors.map((c) => c.replace("0.6", "1")),
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			indexAxis: "y",
			scales: { x: { beginAtZero: true } },
		},
	});
}

/**
 * Generate colors for charts
 */
function generateColors(count) {
	const baseColors = [
		"rgba(102, 126, 234, 0.6)",
		"rgba(118, 75, 162, 0.6)",
		"rgba(255, 99, 132, 0.6)",
		"rgba(75, 192, 192, 0.6)",
		"rgba(255, 206, 86, 0.6)",
		"rgba(153, 102, 255, 0.6)",
		"rgba(255, 159, 64, 0.6)",
		"rgba(54, 162, 235, 0.6)",
		"rgba(201, 203, 207, 0.6)",
	];

	const colors = [];
	for (let i = 0; i < count; i++) {
		colors.push(baseColors[i % baseColors.length]);
	}
	return colors;
}

/**
 * Destroy chart instance if it exists so new chart can be created
 */
function destroyChart(chartId) {
	if (chartInstances[chartId]) {
		chartInstances[chartId].destroy();
		delete chartInstances[chartId];
	}
}

/**
 * Escape HTML to prevent cross site scripting
 */
function escapeHtml(str) {
	return String(str).replace(
		/[&<>"']/g,
		(c) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			}[c])
	);
}

/**
 * Listen for storage changes
 */
window.addEventListener("storage", (e) => {
	if (e.key === STORAGE_KEY || e.key === MILESTONE_KEY) {
		loadData();
	}
});
