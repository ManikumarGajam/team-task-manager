import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [msg, setMsg] = useState("");
  const { user } = useContext(AuthContext);

  // Load comments when modal opens
  const loadComments = async () => {
    try {
      const res = await API.get(`/comments/${taskId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const sendComment = async () => {
    if (!msg.trim()) return;

    try {
      await API.post("/comments", {
        taskId,
        message: msg,
      });

      setMsg("");
      loadComments();
    } catch (err) {
      console.error("Error sending comment:", err);
    }
  };

  return (
    <div style={{ marginTop: "15px" }}>
      <h4>Comments</h4>

      {/* Existing Comments */}
      <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "10px" }}>
        {comments.length > 0 ? (
          comments.map((c) => (
            <div
              key={c._id}
              style={{
                background: "#f0f0f0",
                marginBottom: "6px",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              <strong>{c.author?.name}</strong>
              <p style={{ margin: "4px 0", fontSize: "14px" }}>{c.message}</p>
              <span style={{ fontSize: "11px", opacity: 0.6 }}>
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p style={{ opacity: 0.6 }}>No comments yet.</p>
        )}
      </div>

      {/* Add Comment */}
      <div>
        <input
          placeholder="Write a comment..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          style={{
            width: "75%",
            padding: "6px",
            marginRight: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendComment}
          style={{
            padding: "6px 12px",
            background: "#0275d8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
