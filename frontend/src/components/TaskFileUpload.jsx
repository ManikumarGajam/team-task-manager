import { useState } from "react";
import API from "../api/axios";

export default function TaskFileUpload({ taskId, refresh }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const uploadFile = async () => {
    if (!file) return alert("Please select a file first!");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post(`/files/${taskId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setFileUrl(res.data.file);
      refresh();
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("File upload error:", err);
      alert("Upload failed. Check console.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div style={{ marginTop: "15px" }}>
      <h4>Attachment</h4>

      {/* File input */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: "10px" }}
      />

      {/* Upload button */}
      <button
        onClick={uploadFile}
        disabled={uploading}
        style={{
          padding: "6px 12px",
          background: uploading ? "#999" : "#5bc0de",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {/* Show file URL */}
      {fileUrl && (
        <p style={{ marginTop: "10px", fontSize: "14px" }}>
          Uploaded:{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </p>
      )}
    </div>
  );
}
