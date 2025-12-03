// Key used in localStorage
const STORAGE_KEY = "myProjects";

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

// Save to localStorage
function saveProjects() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
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

    projects.forEach((project, index) => {
        const card = document.createElement("div");
        card.className = "project-card";

        // Compute some display helpers
        const statusLabel =
            project.status === "active" ? "Active"
            : project.status === "pending" ? "Pending"
            : project.status === "completed" ? "Completed"
            : (project.status || "Unknown");

        const statusClass =
            project.status === "active" ? "pill-active"
            : project.status === "pending" ? "pill-pending"
            : project.status === "completed" ? "pill-completed"
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
                <p><strong>Team members:</strong> ${project.teamMembers || "—"}</p>
                <p><strong>Description:</strong> ${project.description || "No description"}</p>
            </div>

            <div class="actions-row">
                <button class="btn-danger small-btn" data-index="${index}">
                    Delete
                </button>
            </div>
        `;

        // Attach delete handler
        const deleteBtn = card.querySelector("button.btn-danger");
        deleteBtn.addEventListener("click", () => deleteProject(index));

        projectsBody.appendChild(card);
    });
}

function clearForm() {
    form.reset();
    statusInput.value = "active";
    nameInput.focus();
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
        hoursPlanning: hoursPlanningInput.value ? Number(hoursPlanningInput.value) : null,
        hoursExecuting: hoursExecutingInput.value ? Number(hoursExecutingInput.value) : null,
        beneficiaries: beneficiariesInput.value.trim(),
        peopleImpacted: peopleImpactedInput.value ? Number(peopleImpactedInput.value) : null,
        tag: tagInput.value.trim()
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

// Initialize
loadProjects();
