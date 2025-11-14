import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [msg, setMsg] = useState("");
  const { user } = useContext(AuthContext);

  const load = async () => {
    const res = await API.get(`/comments/${taskId}`);
    setComments(res.data || []);
  };

  useEffect(() => { if (taskId) load(); }, [taskId]);

  const send = async () => {
    if (!msg.trim()) return;
    await API.post("/comments", { taskId, message: msg });
    setMsg("");
    load();
  };

  return (
    <div>
      <h6>Comments</h6>
      <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 8 }}>
        {comments.length ? comments.map(c => (
          <div key={c._id} className="p-2 mb-2" style={{ background: "var(--card)", borderRadius: 6 }}>
            <div style={{ fontWeight: 600 }}>{c.author?.name}</div>
            <div style={{ color: "var(--muted)" }}>{c.message}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        )) : <div className="text-muted">No comments</div>}
      </div>

      <div className="d-flex gap-2">
        <input className="form-control" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Write a comment..." />
        <button className="btn btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  );
}
