import { useState } from "react";
import API from "../api/axios";

export default function TaskFileUpload({ taskId, refresh }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async () => {
    if (files.length === 0) return alert("Select files first!");
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach(f => form.append("files", f));
      await API.post(`/files/${taskId}`, form);
      setFiles([]);
      refresh();
      alert("Uploaded");
    } catch (err) {
      alert("Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div>
      <div className="d-flex gap-2 align-items-center">
        <input type="file" multiple onChange={e => setFiles([...e.target.files])} />
        <button className="btn btn-sm btn-primary" onClick={uploadFiles} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
