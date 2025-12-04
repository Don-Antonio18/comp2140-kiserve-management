// Key used in localStorage
const STORAGE_KEY = "myProjects";
const MILESTONE_KEY = "myMilestones";

const form = document.getElementById("projectForm");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const startDateInput = document.getElementById("startDate");
const dueDateInput = document.getElementById("dueDate");
const statusInput = document.getElementById("status");
const locationInput = document.getElementById("location");
const committeeInput = document.getElementById("committee");
const teamMembersInput = document.getElementById("teamMembers");
const hoursPlanningInput = document.getElementById("hoursPlanning");
const hoursExecutingInput = document.getElementById("hoursExecuting");
const beneficiariesInput = document.getElementById("beneficiaries");
const peopleImpactedInput = document.getElementById("peopleImpacted");
const tagInput = document.getElementById("tag");

const projectsBody = document.getElementById("projectsBody");
const projectCountSpan = document.getElementById("projectCount");
const emptyStateDiv = document.getElementById("emptyState");
const clearFormBtn = document.getElementById("clearFormBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

let projects = [];
let editingIndex = null; // null when creating new, number when editing an existing project

// Sample projects used for testing/demo
const sampleProjects = [
	{
		id: 1001,
		name: "Community Outreach Drive",
		description: "Beach clean-up and awareness campaign.",
		startDate: "2025-10-01",
		dueDate: "2025-12-15",
		status: "active",
		location: "Mona Campus",
		committee: "Kiwanis Club",
		teamMembers: "Aliyah, John",
		hoursPlanning: 10,
		hoursExecuting: 24,
		beneficiaries: "Local community, students",
		peopleImpacted: 150,
		tag: "Outreach",
	},
	{
		id: 1002,
		name: "School Repainting",
		description: "Repaint the local basic school.",
		startDate: "2025-09-15",
		dueDate: "2025-11-30",
		status: "active",
		location: "St. Johns Basic School",
		committee: "Kiwanis Club",
		teamMembers: "Maya, Omar",
		hoursPlanning: 20,
		hoursExecuting: 40,
		beneficiaries: "Students, teachers",
		peopleImpacted: 0,
		tag: "UI",
	},
	{
		id: 1003,
		name: "Christmas Cookout",
		description: "Serve lunch to the community during the holiday season.",
		startDate: "2025-11-01",
		dueDate: "2025-12-25",
		status: "pending",
		location: "United Church",
		committee: "Kiwanis Club",
		teamMembers: "All",
		hoursPlanning: 15,
		hoursExecuting: 5,
		beneficiaries: "Local community",
		peopleImpacted: 300,
		tag: "Mobile",
	},
];

// Load from localStorage
function loadProjects() {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			projects = JSON.parse(stored) || [];
		} catch (e) {
			console.error("Error parsing stored projects:", e);
			projects = [];
		}
	} else {
		projects = [];
	}
	renderProjects();
}

// Seed sample projects into storage (only if none exist or when forced)
function seedSampleProjects(force = false) {
	if (projects.length === 0 || force) {
		// Clone sample objects so we don't accidentally keep references
		projects = sampleProjects.map((p) => ({ ...p }));
		saveProjects();
		renderProjects();
	}
}

// Prefill the form inputs with a sample project's data (does not save)
function fillFormWithSample(index = 0) {
	const p = sampleProjects[index];
	if (!p) return;
	nameInput.value = p.name || "";
	descriptionInput.value = p.description || "";
	startDateInput.value = p.startDate || "";
	dueDateInput.value = p.dueDate || "";
	statusInput.value = p.status || "active";
	locationInput.value = p.location || "";
	committeeInput.value = p.committee || "";
	teamMembersInput.value = p.teamMembers || "";
	hoursPlanningInput.value = p.hoursPlanning ?? "";
	hoursExecutingInput.value = p.hoursExecuting ?? "";
	beneficiariesInput.value = p.beneficiaries || "";
	peopleImpactedInput.value = p.peopleImpacted ?? "";
	tagInput.value = p.tag || "";
}

// Save to localStorage
function saveProjects() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function getMilestonesFromStorage() {
	try {
		const raw = localStorage.getItem(MILESTONE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) || [];
	} catch (e) {
		console.error("Error reading milestones from storage", e);
		return [];
	}
}

// Render projects as cards
function renderProjects() {
	projectsBody.innerHTML = "";

	if (projects.length === 0) {
		emptyStateDiv.style.display = "block";
	} else {
		emptyStateDiv.style.display = "block";
		if (projects.length > 0) {
			emptyStateDiv.style.display = "none";
		}
	}

	// Update count text
	projectCountSpan.textContent =
		projects.length === 1
			? "1 project saved"
			: `${projects.length} projects saved`;

	// load milestones once to compute summaries
	const allMilestones = getMilestonesFromStorage();

	projects.forEach((project, index) => {
		const card = document.createElement("div");
		card.className = "project-card";

		// Compute some display helpers
		const statusLabel =
			project.status === "active"
				? "Active"
				: project.status === "pending"
				? "Pending"
				: project.status === "completed"
				? "Completed"
				: project.status || "Unknown";

		const statusClass =
			project.status === "active"
				? "pill-active"
				: project.status === "pending"
				? "pill-pending"
				: project.status === "completed"
				? "pill-completed"
				: "";

		const dateRangeText = (() => {
			const s = project.startDate;
			const e = project.dueDate;
			if (!s && !e) return "Dates: —";
			if (s && !e) return `From ${s}`;
			if (!s && e) return `Until ${e}`;
			return `${s} → ${e}`;
		})();

		const hoursText = (() => {
			const hp = project.hoursPlanning ?? null;
			const he = project.hoursExecuting ?? null;
			if (hp === null && he === null) return "—";
			return `Planning: ${hp ?? 0}h | Executing: ${he ?? 0}h`;
		})();

		const impactCountText =
			project.peopleImpacted !== null &&
			project.peopleImpacted !== undefined &&
			project.peopleImpacted !== ""
				? `${project.peopleImpacted} people`
				: "—";

		const beneficiariesText = project.beneficiaries || "—";

		// Milestone summary for this project
		const related = allMilestones.filter(
			(m) => String(m.projectId) === String(project.id)
		);
		const totalMilestones = related.length;
		const doneMilestones = related.filter((m) => m.completed).length;
		const milestoneSummaryHTML =
			totalMilestones > 0
				? `<div class="milestone-summary" style="font-size:12px;color:#555;margin-top:6px">${doneMilestones}/${totalMilestones} milestones complete</div>`
				: "";

		// Build inner HTML
		card.innerHTML = `
            <div class="header">
                <div>
                    <h3>${project.name}</h3>
                    <div class="meta-line">
                        ${project.tag ? `<span>Tag: ${project.tag}</span>` : ""}
                    </div>
                </div>
                <div class="status-wrap">
                    <span class="status-text">Status</span>
                    <span class="pill ${statusClass}">${statusLabel}</span>
                    ${milestoneSummaryHTML}
                </div>
            </div>

            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Dates:</span>
                    <span> ${dateRangeText}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Location:</span>
                    <span> ${project.location || "—"}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Committee:</span>
                    <span> ${project.committee || "—"}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Hours:</span>
                    <span> ${hoursText}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Impact (count):</span>
                    <span> ${impactCountText}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Beneficiaries:</span>
                    <span> ${beneficiariesText}</span>
                </div>
            </div>

            <div class="body-text">
                <p><strong>Team members:</strong> ${
									project.teamMembers || "—"
								}</p>
                <p><strong>Description:</strong> ${
									project.description || "No description"
								}</p>
            </div>

            <div class="actions-row">
                <button class="btn-secondary small-btn edit-btn" data-index="${index}">Edit</button>
                <button class="btn-danger small-btn" data-index="${index}">
                    Delete
                </button>
            </div>
        `;

		// Attach delete handler
		const deleteBtn = card.querySelector("button.btn-danger");
		deleteBtn.addEventListener("click", () => deleteProject(index));

		// Attach edit handler
		const editBtn = card.querySelector("button.edit-btn");
		if (editBtn) editBtn.addEventListener("click", () => startEdit(index));

		projectsBody.appendChild(card);
	});
}

// Start editing a project: populate form and set editingIndex
function startEdit(index) {
	const p = projects[index];
	if (!p) return;
	editingIndex = index;
	nameInput.value = p.name || "";
	descriptionInput.value = p.description || "";
	startDateInput.value = p.startDate || "";
	dueDateInput.value = p.dueDate || "";
	statusInput.value = p.status || "active";
	locationInput.value = p.location || "";
	committeeInput.value = p.committee || "";
	teamMembersInput.value = p.teamMembers || "";
	hoursPlanningInput.value = p.hoursPlanning ?? "";
	hoursExecutingInput.value = p.hoursExecuting ?? "";
	beneficiariesInput.value = p.beneficiaries || "";
	peopleImpactedInput.value = p.peopleImpacted ?? "";
	tagInput.value = p.tag || "";

	const submitBtn = document.getElementById("submitBtn");
	if (submitBtn) submitBtn.textContent = "Save Changes";
	const cancelBtn = document.getElementById("cancelEditBtn");
	if (cancelBtn) cancelBtn.style.display = "inline-block";
	nameInput.focus();
}

function cancelEdit() {
	clearForm();
}

function clearForm() {
	form.reset();
	statusInput.value = "active";
	nameInput.focus();
	// reset editing state
	editingIndex = null;
	const submitBtn = document.getElementById("submitBtn");
	if (submitBtn) submitBtn.textContent = "+ Add Project";
	const cancelBtn = document.getElementById("cancelEditBtn");
	if (cancelBtn) cancelBtn.style.display = "none";
}

// Add a new project
function addProject(event) {
	event.preventDefault();

	const name = nameInput.value.trim();
	if (!name) {
		alert("Project name is required.");
		nameInput.focus();
		return;
	}

	// If editing, update existing project
	if (editingIndex !== null && projects[editingIndex]) {
		const existing = projects[editingIndex];
		existing.name = name;
		existing.description = descriptionInput.value.trim();
		existing.startDate = startDateInput.value;
		existing.dueDate = dueDateInput.value;
		existing.status = statusInput.value;
		existing.location = locationInput.value.trim();
		existing.committee = committeeInput.value.trim();
		existing.teamMembers = teamMembersInput.value.trim();
		existing.hoursPlanning = hoursPlanningInput.value
			? Number(hoursPlanningInput.value)
			: null;
		existing.hoursExecuting = hoursExecutingInput.value
			? Number(hoursExecutingInput.value)
			: null;
		existing.beneficiaries = beneficiariesInput.value.trim();
		existing.peopleImpacted = peopleImpactedInput.value
			? Number(peopleImpactedInput.value)
			: null;
		existing.tag = tagInput.value.trim();

		saveProjects();
		renderProjects();
		clearForm();
		return;
	}

	const project = {
		id: Date.now(),
		name,
		description: descriptionInput.value.trim(),
		startDate: startDateInput.value,
		dueDate: dueDateInput.value,
		status: statusInput.value,
		location: locationInput.value.trim(),
		committee: committeeInput.value.trim(),
		teamMembers: teamMembersInput.value.trim(),
		hoursPlanning: hoursPlanningInput.value
			? Number(hoursPlanningInput.value)
			: null,
		hoursExecuting: hoursExecutingInput.value
			? Number(hoursExecutingInput.value)
			: null,
		beneficiaries: beneficiariesInput.value.trim(),
		peopleImpacted: peopleImpactedInput.value
			? Number(peopleImpactedInput.value)
			: null,
		tag: tagInput.value.trim(),
	};

	projects.push(project);
	saveProjects();
	renderProjects();
	clearForm();
}

// Delete one project
function deleteProject(index) {
	if (!confirm("Delete this project?")) return;
	projects.splice(index, 1);
	saveProjects();
	renderProjects();
}

// Clear all projects
function clearAll() {
	if (projects.length === 0) return;
	if (!confirm("This will remove all saved projects. Continue?")) return;
	projects = [];
	saveProjects();
	renderProjects();
}

// Event listeners
form.addEventListener("submit", addProject);
clearFormBtn.addEventListener("click", clearForm);
clearAllBtn.addEventListener("click", clearAll);
const cancelEditBtn = document.getElementById("cancelEditBtn");
if (cancelEditBtn) cancelEditBtn.addEventListener("click", cancelEdit);

// Initialize
loadProjects();

// If no projects exist, auto-seed sample data and prefill the form for convenience
if (projects.length === 0) {
	seedSampleProjects();
	// Prefill the form with the first sample so users can press Add to add variants
	fillFormWithSample(0);
}

// If another page requested to open a project for editing, handle it now
try {
	const openId = localStorage.getItem("openProjectId");
	if (openId) {
		// find index and start edit
		const idx = projects.findIndex((p) => String(p.id) === String(openId));
		if (idx !== -1) startEdit(idx);
		localStorage.removeItem("openProjectId");
	}
} catch (e) {
	console.error("openProjectId handling failed", e);
}

// Hook up the 'Load Sample Data' button to force-seed or prefill
const loadSampleBtn = document.getElementById("loadSampleBtn");
if (loadSampleBtn) {
	loadSampleBtn.addEventListener("click", () => {
		if (!confirm("This will insert sample projects into storage. Continue?"))
			return;
		seedSampleProjects(true);
	});
}

// Reload projects when milestones change in another tab/window so summaries stay up-to-date
window.addEventListener("storage", (e) => {
	if (e.key === MILESTONE_KEY || e.key === STORAGE_KEY) {
		loadProjects();
	}
});
