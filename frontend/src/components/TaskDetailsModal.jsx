import { useEffect, useState } from "react";
import API from "../api/axios";
import TaskComments from "./TaskComments";
import TaskFileUpload from "./TaskFileUpload";

export default function TaskDetailsModal({ task, onClose, refresh }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  // load task details (comments, activities, files, members, etc.)
  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/tasks/detail/${task._id}`);
      setDetails(res.data);
    } catch (err) {
      console.error("Error loading task details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (task) {
      loadDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, reload]);

  const refreshModal = () => setReload((n) => n + 1);

  // assign/unassign user
  const handleAssign = async (userId) => {
    try {
      await API.put(`/tasks/${details._id}/assign`, { userId: userId || undefined });
      refreshModal();
      refresh?.();
    } catch (err) {
      console.error("Assign error:", err);
      alert(err.response?.data?.message || "Failed to assign");
    }
  };

  // delete file (by index)
  const handleDeleteFile = async (index) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await API.delete(`/files/${details._id}/${index}`);
      refreshModal();
      refresh?.();
    } catch (err) {
      console.error("Delete file error:", err);
      alert(err.response?.data?.message || "Failed to delete file");
    }
  };

  if (!task) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card" aria-label={`Task details: ${task.title}`}>
        {/* Close button top-right */}
        <button
          className="close-btn"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        {loading || !details ? (
          <div style={{ paddingTop: 20 }}>
            <p>Loading task…</p>
          </div>
        ) : (
          <>
            {/* Header (title & basic meta) */}
            <div>
              <h3 style={{ margin: 0, color: "var(--modal-text)" }}>{details.title}</h3>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                {details.project?.name ? `${details.project.name}` : ""}
                {details.dueDate ? ` • Due: ${new Date(details.dueDate).toLocaleDateString()}` : ""}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="modal-scroll">
              {/* Description */}
              {details.description && (
                <div style={{ marginTop: 12, color: "var(--modal-text)" }}>
                  <strong style={{ display: "block", marginBottom: 6 }}>Description</strong>
                  <div style={{ color: "var(--modal-text)" }}>{details.description}</div>
                </div>
              )}

              {/* Assignee */}
              <div style={{ marginTop: 14 }}>
                <strong>Assignee:</strong>{" "}
                <span style={{ color: "var(--modal-text)" }}>
                  {details.assignee?.name ? `${details.assignee.name} (${details.assignee.email})` : "Unassigned"}
                </span>

                <div style={{ marginTop: 8 }}>
                  <select
                    className="form-select"
                    value={details.assignee?._id || ""}
                    onChange={(e) => handleAssign(e.target.value || null)}
                    style={{ maxWidth: 320 }}
                  >
                    <option value="">-- Unassign --</option>
                    {(details.projectMembers || []).map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attachments */}
              <div style={{ marginTop: 18 }}>
                <h4>Attachments</h4>

                {details.files && details.files.length > 0 ? (
                  details.files.map((file, idx) => (
                    <div className="file-row" key={idx}>
                      <a href={file.url} target="_blank" rel="noreferrer" style={{ color: "var(--modal-text)" }}>
                        {file.fileName}
                      </a>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="delete-file-btn"
                          onClick={() => handleDeleteFile(idx)}
                          title="Delete file"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "var(--muted)" }}>No attachments</div>
                )}

                {/* File upload component */}
                <div style={{ marginTop: 10 }}>
                  <TaskFileUpload
                    taskId={details._id}
                    refresh={() => {
                      refreshModal();
                      refresh?.();
                    }}
                  />
                </div>
              </div>

              {/* Comments */}
              <div style={{ marginTop: 18 }}>
                <h4>Comments</h4>
                <TaskComments
                  taskId={details._id}
                />
              </div>

              {/* Activity */}
              <div style={{ marginTop: 18 }}>
                <h4>Activity</h4>
                {details.activities && details.activities.length > 0 ? (
                  details.activities.map((act) => (
                    <div className="activity-card" key={act._id}>
                      <div style={{ fontWeight: 600, color: "var(--modal-text)" }}>{act.action}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        by {act.user?.name} • {new Date(act.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "var(--muted)" }}>No activity yet.</div>
                )}
              </div>
            </div>

            {/* Footer: close button (redundant) */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
