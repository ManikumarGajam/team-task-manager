import { useState } from "react";
import API from "../api/axios";

export default function CreateTaskModal({ projectId, onClose, refresh }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const createTask = async () => {
    if (!form.title) {
      alert("Title is required");
      return;
    }

    await API.post("/tasks", {
      projectId,
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
    });

    refresh();      // reload tasks in board  
    onClose();      // close modal  
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "38%",
        background: "white",
        padding: "20px",
        width: "300px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        zIndex: 10,
      }}
    >
      <h3>Create Task</h3>

      <input
        placeholder="Title"
        style={{ width: "100%", marginBottom: "8px" }}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <input
        placeholder="Description"
        style={{ width: "100%", marginBottom: "8px" }}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <input
        type="date"
        style={{ width: "100%", marginBottom: "8px" }}
        onChange={(e) =>
          setForm({ ...form, dueDate: e.target.value })
        }
      />

      <button onClick={createTask} style={{ marginRight: "10px" }}>
        Create
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
