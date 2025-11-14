import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";   // 🔥 NEW
import API from "../api/axios";
import TaskBoard from "../components/TaskBoard";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { dark, setDark } = useContext(ThemeContext); // 🔥 NEW

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  // For creating project
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: ""
  });

  // Add member
  const [memberEmail, setMemberEmail] = useState("");

  // Load existing projects
  const loadProjects = async () => {
    const res = await API.get("/projects");
    setProjects(res.data);

    // Auto select first project
    if (!activeProject && res.data.length > 0) {
      setActiveProject(res.data[0]._id);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Create Project
  const createProject = async () => {
    if (!projectForm.name) return alert("Project name required");

    await API.post("/projects", projectForm);

    setProjectForm({ name: "", description: "" });

    await loadProjects();
  };

  // Add member to project
  const addMember = async () => {
    if (!memberEmail) return alert("Enter member email");

    // Fetch user by email
    const res = await API.get(`/auth/find/${memberEmail}`).catch(() => null);

    if (!res || !res.data) {
      return alert("User not found. Ask them to signup first.");
    }

    const userId = res.data._id;

    await API.put(`/projects/${activeProject}/add-member`, { userId });

    alert("Member added!");
    setMemberEmail("");

    await loadProjects();
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>Welcome {user?.name}</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* DARK / LIGHT MODE TOGGLE */}
          <button
            onClick={() => setDark(!dark)}
            style={{
              padding: "6px 12px",
              background: dark ? "#444" : "#222",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          {/* LOGOUT */}
          <button
            onClick={logout}
            style={{
              padding: "6px 12px",
              background: "#d9534f",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* CREATE PROJECT */}
      <div>
        <h3>Create New Project</h3>

        <input
          placeholder="Project Name"
          value={projectForm.name}
          onChange={(e) =>
            setProjectForm({ ...projectForm, name: e.target.value })
          }
          style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />

        <input
          placeholder="Project Description"
          value={projectForm.description}
          onChange={(e) =>
            setProjectForm({ ...projectForm, description: e.target.value })
          }
          style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={createProject}
          style={{
            padding: "8px 12px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Create Project
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* SELECT PROJECT */}
      <div>
        <h3>Your Projects</h3>
        <select
          onChange={(e) => setActiveProject(e.target.value)}
          value={activeProject || ""}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        >
          <option value="" disabled>Select a project</option>
          {projects.map((p) => (
            <option value={p._id} key={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* ADD MEMBER */}
      {activeProject && (
        <div style={{ marginTop: "20px" }}>
          <h3>Add Member to Project</h3>

          <input
            placeholder="Member Email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            style={{
              padding: "8px",
              marginRight: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={addMember}
            style={{
              padding: "8px 12px",
              background: "#0275d8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Add Member
          </button>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      {/* TASK BOARD */}
      {activeProject ? (
        <TaskBoard projectId={activeProject} />
      ) : (
        <p>No project selected</p>
      )}
    </div>
  );
}
