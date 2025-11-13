import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import TaskBoard from "../components/TaskBoard";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

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

    // auto set first project
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

    // reset form
    setProjectForm({ name: "", description: "" });

    // reload projects
    await loadProjects();
  };

  // Add member to project
  const addMember = async () => {
    if (!memberEmail) return alert("Enter member email");

    // We need userId of the member → so we fetch user by email
    const res = await API.get("/auth/find/" + memberEmail).catch(() => null);

    if (!res || !res.data) return alert("User not found. Ask them to signup first.");

    const userId = res.data._id;

    await API.put(`/projects/${activeProject}/add-member`, { userId });

    alert("Member added!");
    setMemberEmail("");

    await loadProjects();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome {user?.name}</h2>
      <button onClick={logout}>Logout</button>

      {/* CREATE PROJECT */}
      <h3>Create New Project</h3>
      <input
        placeholder="Project Name"
        value={projectForm.name}
        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
      />
      <input
        placeholder="Project Description"
        value={projectForm.description}
        onChange={(e) =>
          setProjectForm({ ...projectForm, description: e.target.value })
        }
      />
      <button onClick={createProject}>Create Project</button>

      <hr />

      {/* SELECT PROJECT */}
      <h3>Your Projects</h3>
      <select
        onChange={(e) => setActiveProject(e.target.value)}
        value={activeProject || ""}
      >
        <option value="" disabled>
          Select a project
        </option>
        {projects.map((p) => (
          <option value={p._id} key={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* ADD MEMBER */}
      {activeProject && (
        <>
          <h3>Add Member to Project</h3>
          <input
            placeholder="Member Email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <button onClick={addMember}>Add Member</button>
        </>
      )}

      <hr />

      {/* TASK BOARD */}
      {activeProject ? (
        <TaskBoard projectId={activeProject} />
      ) : (
        <p>No project selected</p>
      )}
    </div>
  );
}
