// Same key as Feature 01 so we can reuse the stored projects
const STORAGE_KEY = "myProjects";

const reportForm = document.getElementById("reportForm");
const reportTitleInput = document.getElementById("reportTitle");
const periodStartInput = document.getElementById("periodStart");
const periodEndInput = document.getElementById("periodEnd");
const scheduleDateInput = document.getElementById("scheduleDate");
const includeStatusesSelect = document.getElementById("includeStatuses");

const clearFormBtn = document.getElementById("clearFormBtn");
const reloadBtn = document.getElementById("reloadBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

const projectsSummarySpan = document.getElementById("projectsSummary");
const emptyStateDiv = document.getElementById("emptyState");
const reportOutput = document.getElementById("reportOutput");

let allProjects = [];

// -------- Load projects from localStorage --------
function loadProjects() {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			allProjects = JSON.parse(stored) || [];
		} catch (e) {
			console.error("Error parsing stored projects:", e);
			allProjects = [];
		}
	} else {
		allProjects = [];
	}

	if (allProjects.length === 0) {
		projectsSummarySpan.textContent = "No projects found in storage.";
		emptyStateDiv.style.display = "block";
	} else {
		projectsSummarySpan.textContent = `${allProjects.length} projects available for reporting.`;
		emptyStateDiv.style.display = "none";
	}
}

// -------- Helpers --------
function getSelectedStatuses() {
	return Array.from(includeStatusesSelect.selectedOptions).map(
		(opt) => opt.value
	);
}

function parseDate(value) {
	return value ? new Date(value + "T00:00:00") : null;
}

function projectMatchesRange(project, start, end) {
	// Use dueDate if available, else startDate as representative date
	const projDateStr = project.dueDate || project.startDate;
	if (!projDateStr) return false;

	const projDate = parseDate(projDateStr);
	if (!projDate) return false;

	if (start && projDate < start) return false;
	if (end && projDate > end) return false;
	return true;
}

function buildReportTemplate(filteredProjects, meta) {
	const { title, start, end, scheduleDate } = meta;

	const completed = filteredProjects.filter((p) => p.status === "completed");
	const ongoing = filteredProjects.filter(
		(p) => p.status === "active" || p.status === "pending"
	);

	const total = filteredProjects.length;
	const todayStr = new Date().toLocaleString();

	// If nothing matches, return an "empty template"
	if (total === 0) {
		return `${title || "Project Report"}

Reporting Period: ${start || "N/A"} to ${end || "N/A"}
Scheduled Report Date: ${scheduleDate || "N/A"}
Generated On: ${todayStr}

Summary:
- No projects were found for the selected period and statuses.
- Use this template to manually record any relevant activities or notes.

Sections to complete:
1. Overview of activities
2. Highlights / key achievements
3. Challenges encountered
4. Recommendations / next steps

`;
	}

	// Build section lines for completed
	const completedLines =
		completed.length === 0
			? ["(No completed projects in this period.)"]
			: completed.map((p, idx) => {
					return `${idx + 1}. ${p.name}
   Dates: ${p.startDate || "N/A"} to ${p.dueDate || "N/A"}
   Committee: ${p.committee || "N/A"}
   Location: ${p.location || "N/A"}
   Hours: planning ${p.hoursPlanning ?? 0}h, executing ${p.hoursExecuting ?? 0}h
   Beneficiaries: ${p.beneficiaries || "N/A"}
   People impacted: ${p.peopleImpacted ?? "N/A"}
   Notes: ${p.description || "N/A"}

`;
			  });

	// Build section lines for ongoing
	const ongoingLines =
		ongoing.length === 0
			? ["(No ongoing projects in this period.)"]
			: ongoing.map((p, idx) => {
					return `${idx + 1}. ${p.name}
   Status: ${p.status}
   Dates: ${p.startDate || "N/A"} to ${p.dueDate || "N/A"}
   Committee: ${p.committee || "N/A"}
   Location: ${p.location || "N/A"}
   Hours so far: planning ${p.hoursPlanning ?? 0}h, executing ${
						p.hoursExecuting ?? 0
					}h
   Beneficiaries (target/actual): ${p.beneficiaries || "N/A"}
   People impacted (so far): ${p.peopleImpacted ?? "N/A"}
   Next steps: ____________________________

`;
			  });

	return `${title || "Project Report"}

Reporting Period: ${start || "N/A"} to ${end || "N/A"}
Scheduled Report Date: ${scheduleDate || "N/A"}
Generated On: ${todayStr}

Summary:
- Total projects in this period: ${total}
- Completed: ${completed.length}
- Ongoing / Pending: ${ongoing.length}

--------------------------------------------------
1. Completed Projects
--------------------------------------------------
${completedLines.join("")}
--------------------------------------------------
2. Ongoing / Active Projects
--------------------------------------------------
${ongoingLines.join("")}
--------------------------------------------------
3. Overall Reflections / Challenges
--------------------------------------------------
- Key successes:
  • __________________________________________
  • __________________________________________

- Challenges:
  • __________________________________________
  • __________________________________________

- Recommendations / Next Steps:
  • __________________________________________
  • __________________________________________

`;
}

// -------- Main: generate report --------
function handleGenerateReport(event) {
	event.preventDefault();

	const title = reportTitleInput.value.trim();
	const startStr = periodStartInput.value || "";
	const endStr = periodEndInput.value || "";
	const scheduleStr = scheduleDateInput.value || "";

	const startDate = parseDate(startStr);
	const endDate = parseDate(endStr);
	const selectedStatuses = getSelectedStatuses();

	const filtered = allProjects.filter((p) => {
		if (!selectedStatuses.includes(p.status)) return false;
		return projectMatchesRange(p, startDate, endDate);
	});

	const template = buildReportTemplate(filtered, {
		title,
		start: startStr,
		end: endStr,
		scheduleDate: scheduleStr,
	});

	reportOutput.value = template;

	projectsSummarySpan.textContent = `${filtered.length} project(s) included in this report out of ${allProjects.length} total.`;
}

function clearForm() {
	reportForm.reset();
	// Re-select default statuses
	Array.from(includeStatusesSelect.options).forEach((opt) => {
		opt.selected = opt.value === "completed" || opt.value === "active";
	});
	reportOutput.value = "";
	projectsSummarySpan.textContent = `${allProjects.length} projects available for reporting.`;
}

// -------- Extra: copy & download --------
function copyToClipboard() {
	reportOutput.select();
	document.execCommand("copy");
	alert("Report copied to clipboard.");
}

function downloadReport() {
	const blob = new Blob([reportOutput.value], {
		type: "text/plain;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	const title = reportTitleInput.value.trim() || "project-report";
	a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.txt`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// -------- Event listeners --------
reportForm.addEventListener("submit", handleGenerateReport);
clearFormBtn.addEventListener("click", clearForm);
reloadBtn.addEventListener("click", loadProjects);
copyBtn.addEventListener("click", copyToClipboard);
downloadBtn.addEventListener("click", downloadReport);

// Init: Load projects and auto-generate initial report if projects exist
loadProjects();
window.addEventListener("storage", loadProjects);

// Auto-generate report on page load if projects are available
document.addEventListener("DOMContentLoaded", () => {
	if (allProjects.length > 0) {
		// Set default status selections
		Array.from(includeStatusesSelect.options).forEach((opt) => {
			opt.selected = opt.value === "completed" || opt.value === "active";
		});
		// Trigger generation with current form values
		const event = new Event("submit");
		reportForm.dispatchEvent(event);
	}
});
