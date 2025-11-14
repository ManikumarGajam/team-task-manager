import { useState, useEffect } from "react";
import API from "../api/axios";

export default function CreateTaskModal({ projectId, onClose, refresh }) {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", assignee: "" });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    API.get(`/projects/${projectId}/members`).then(res => setMembers(res.data || []));
  }, [projectId]);

  const createTask = async () => {
    if (!form.title) { alert("Title required"); return; }
    try {
      await API.post("/tasks", { projectId, title: form.title, description: form.description, dueDate: form.dueDate, assignee: form.assignee || undefined });
      refresh(); onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h5>Create Task</h5>

        <input className="form-control my-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
        <input className="form-control my-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <input className="form-control my-2" type="date" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} />
        <select className="form-select my-2" value={form.assignee} onChange={e=>setForm({...form, assignee:e.target.value})}>
          <option value="">-- No Assignee --</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
        </select>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={createTask}>Create</button>
        </div>
      </div>
    </div>
  );
}
