let allWidgets = [];
let chartInstances = {};

document.addEventListener("DOMContentLoaded", function () {
	loadPersonalizedDashboard();
	attachFilterListeners();
});

/**
 * Load personalized dashboard data from backend.
 */
function loadPersonalizedDashboard() {
	fetch("/api/dashboard/personalized")
		.then((res) => res.json())
		.then((data) => {
			allWidgets = data.widgets || [];
			renderCharts(allWidgets);
		})
		.catch((err) => console.error("Error loading dashboard:", err));
}

/**
 * Attach event listeners to filter/sort controls.
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
 * Apply filters and sorting based on control values.
 */
function applyFilters() {
	const status = document.getElementById("filterStatus").value || null;
	const tag = document.getElementById("filterTag").value || null;
	const committee = document.getElementById("filterCommittee").value || null;
	const sortBy = document.getElementById("sortBy").value;
	const sortOrder = document.getElementById("sortOrder").value === "asc";

	const params = new URLSearchParams();
	if (status) params.append("status", status);
	if (tag) params.append("tag", tag);
	if (committee) params.append("committee", committee);

	fetch(`/api/dashboard/personalized?${params.toString()}`)
		.then((res) => res.json())
		.then((data) => {
			allWidgets = data.widgets || [];
			sortWidgets(allWidgets, sortBy, sortOrder);
			renderCharts(allWidgets);
		})
		.catch((err) => console.error("Error applying filters:", err));
}

/**
 * Reset filters and reload all data.
 */
function resetFilters() {
	document.getElementById("filterStatus").value = "";
	document.getElementById("filterTag").value = "";
	document.getElementById("filterCommittee").value = "";
	document.getElementById("sortBy").value = "date";
	document.getElementById("sortOrder").value = "asc";
	loadPersonalizedDashboard();
}

/**
 * Sort widgets array by a given key.
 */
function sortWidgets(widgets, key, ascending) {
	widgets.sort((a, b) => {
		const va = a[key];
		const vb = b[key];
		if (va === null || va === undefined) return -1;
		if (vb === null || vb === undefined) return 1;
		if (typeof va === "number" && typeof vb === "number") {
			return ascending ? va - vb : vb - va;
		}
		const comparison = String(va).localeCompare(String(vb));
		return ascending ? comparison : -comparison;
	});
}

/**
 * Render all charts based on widget data.
 */
function renderCharts(widgets) {
	renderTimeSeriesChart(widgets);
	renderTagDistributionChart(widgets);
	renderStatusDistributionChart(widgets);
	renderCommitteeChart(widgets);
	renderHoursVsBeneficiariesChart(widgets);
	renderValueDistributionChart(widgets);
}

/**
 * Time-series chart: Projects, Hours, Value over time.
 */
function renderTimeSeriesChart(widgets) {
	fetch("/api/dashboard/chart")
		.then((res) => res.json())
		.then((data) => {
			const labels = data.map((p) => p.date);
			const projects = data.map((p) => p.projects);
			const hours = data.map((p) => p.hours);
			const values = data.map((p) => p.value);

			destroyChart("timeSeriesChart");
			const ctx = document.getElementById("timeSeriesChart").getContext("2d");
			chartInstances.timeSeriesChart = new Chart(ctx, {
				type: "line",
				data: {
					labels: labels,
					datasets: [
						{
							label: "Projects",
							data: projects,
							borderColor: "rgba(54, 162, 235, 1)",
							backgroundColor: "rgba(54, 162, 235, 0.1)",
							fill: true,
							yAxisID: "y",
						},
						{
							label: "Hours",
							data: hours,
							borderColor: "rgba(255, 99, 132, 1)",
							backgroundColor: "rgba(255, 99, 132, 0.1)",
							fill: true,
							yAxisID: "y1",
						},
						{
							label: "Value ($)",
							data: values,
							borderColor: "rgba(75, 192, 75, 1)",
							backgroundColor: "rgba(75, 192, 75, 0.1)",
							fill: true,
							yAxisID: "y2",
						},
					],
				},
				options: {
					responsive: true,
					interaction: { mode: "index", intersect: false },
					scales: {
						y: { type: "linear", position: "left" },
						y1: {
							type: "linear",
							position: "center",
							grid: { drawOnChartArea: false },
						},
						y2: {
							type: "linear",
							position: "right",
							grid: { drawOnChartArea: false },
						},
					},
				},
			});
		})
		.catch((err) => console.error("Error loading time-series chart:", err));
}

/**
 * Bar chart: Tag distribution (percentage of projects).
 */
function renderTagDistributionChart(widgets) {
	const tagCounts = {};
	widgets.forEach((w) => {
		if (w.tags && Array.isArray(w.tags)) {
			w.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		}
	});

	const total = widgets.length || 1;
	const labels = Object.keys(tagCounts);
	const percentages = Object.values(tagCounts).map((count) =>
		((count / total) * 100).toFixed(2)
	);
	const colors = generateColors(labels.length);

	destroyChart("tagDistributionChart");
	const ctx = document.getElementById("tagDistributionChart").getContext("2d");
	chartInstances.tagDistributionChart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Percentage of Projects (%)",
					data: percentages,
					backgroundColor: colors,
					borderColor: colors.map((c) => c.replace("0.6", "1")),
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			scales: { y: { beginAtZero: true, max: 100 } },
		},
	});
}

/**
 * Pie chart: Project status distribution.
 */
function renderStatusDistributionChart(widgets) {
	const statusCounts = {};
	widgets.forEach((w) => {
		const status = w.status || "unknown";
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
 * Bar chart: Projects by committee.
 */
function renderCommitteeChart(widgets) {
	const committeeCounts = {};
	widgets.forEach((w) => {
		const committee = w.committee || "Unassigned";
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
		options: { responsive: true, scales: { y: { beginAtZero: true } } },
	});
}

/**
 * Scatter/Line chart: Hours vs Beneficiaries.
 */
function renderHoursVsBeneficiariesChart(widgets) {
	const data = widgets.map((w) => ({
		x: w.hours || 0,
		y: w.beneficiaries || 0,
		title: w.title,
	}));

	const colors = generateColors(1);

	destroyChart("hoursVsBeneficiariesChart");
	const ctx = document
		.getElementById("hoursVsBeneficiariesChart")
		.getContext("2d");
	chartInstances.hoursVsBeneficiariesChart = new Chart(ctx, {
		type: "scatter",
		data: {
			datasets: [
				{
					label: "Projects (Hours vs Beneficiaries)",
					data: data,
					backgroundColor: colors[0],
					borderColor: colors[0].replace("0.6", "1"),
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				x: { title: { display: true, text: "Hours" } },
				y: { title: { display: true, text: "Beneficiaries" } },
			},
		},
	});
}

/**
 * Doughnut chart: Project value distribution.
 */
function renderValueDistributionChart(widgets) {
	const labels = widgets.map((w) => w.title || "Unknown");
	const data = widgets.map((w) => w.value || 0);
	const colors = generateColors(labels.length);

	destroyChart("valueDistributionChart");
	const ctx = document
		.getElementById("valueDistributionChart")
		.getContext("2d");
	chartInstances.valueDistributionChart = new Chart(ctx, {
		type: "doughnut",
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
 * Generate random colors for charts.
 */
function generateColors(count) {
	const colors = [];
	const hues = [
		"rgba(54, 162, 235, 0.6)",
		"rgba(255, 99, 132, 0.6)",
		"rgba(75, 192, 75, 0.6)",
		"rgba(255, 206, 86, 0.6)",
		"rgba(153, 102, 255, 0.6)",
		"rgba(255, 159, 64, 0.6)",
		"rgba(199, 199, 199, 0.6)",
		"rgba(83, 102, 255, 0.6)",
		"rgba(255, 99, 255, 0.6)",
		"rgba(99, 255, 132, 0.6)",
	];
	for (let i = 0; i < count; i++) {
		colors.push(hues[i % hues.length]);
	}
	return colors;
}

/**
 * Destroy a chart instance if it exists.
 */
function destroyChart(chartId) {
	if (chartInstances[chartId]) {
		chartInstances[chartId].destroy();
		delete chartInstances[chartId];
	}
}
