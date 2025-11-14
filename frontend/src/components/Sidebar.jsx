import React from "react";

export default function Sidebar({ projects, activeProject, setActiveProject, onCreateProject, onOpenCreateProject }) {
  return (
    <aside className="app-sidebar d-flex flex-column">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Projects</h6>
        <button className="btn btn-sm btn-success" onClick={onOpenCreateProject}>+ New</button>
      </div>

      <div style={{ overflowY: "auto" }}>
        {projects.length === 0 && <div className="text-muted">No projects yet</div>}
        {projects.map((p) => (
          <div
            key={p._id}
            className={`project-item ${p._id === activeProject ? "bg-primary text-white" : ""}`}
            onClick={() => setActiveProject(p._id)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.description || ""}</div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{/* placeholder for count */}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
