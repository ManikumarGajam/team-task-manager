import { useEffect, useState } from "react";
import API from "../api/axios";
import Comments from "./TaskComments";
import FileUpload from "./TaskFileUpload";

export default function TaskDetailsModal({ task, onClose, refresh }) {
  const [details, setDetails] = useState(task);
  const [loading, setLoading] = useState(true);

  // Fetch full task details on modal open
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await API.get(`/tasks/detail/${task._id}`);
        setDetails(res.data);
      } catch (err) {
        console.error("Error loading task details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [task]);

  if (!details || loading) {
    return (
      <div style={{
        position: "fixed",
        top: "20%",
        left: "40%",
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
        zIndex: 100
      }}>
        <p>Loading task…</p>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: "10%",
      left: "35%",
      width: "420px",
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 3px 15px rgba(0,0,0,0.3)",
      zIndex: 100
    }}>
      {/* Title */}
      <h2>{details.title}</h2>

      {/* Description */}
      <p style={{ opacity: 0.8 }}>{details.description}</p>

      {/* Status */}
      <p><strong>Status:</strong> {details.status}</p>

      {/* Due Date */}
      {details.dueDate && (
        <p>
          <strong>Due:</strong>{" "}
          {new Date(details.dueDate).toLocaleDateString()}
        </p>
      )}

      {/* Attachments */}
      <div style={{ marginTop: "15px" }}>
        <FileUpload taskId={details._id} refresh={refresh} />
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: "20px" }}>
        <Comments taskId={details._id} />
      </div>

      {/* Activity Log */}
      <div style={{ marginTop: "20px" }}>
        <h4>Activity Log</h4>

        {details.activities && details.activities.length > 0 ? (
          details.activities.map((log) => (
            <p
              key={log._id}
              style={{
                fontSize: "13px",
                background: "#f4f4f4",
                padding: "6px",
                borderRadius: "6px",
                marginBottom: "6px"
              }}
            >
              {log.action} by <strong>{log.user?.name}</strong> <br />
              <span style={{ opacity: 0.6 }}>
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </p>
          ))
        ) : (
          <p style={{ opacity: 0.6 }}>No activity yet.</p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          marginTop: "15px",
          padding: "8px 12px",
          background: "#d9534f",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
  );
}
