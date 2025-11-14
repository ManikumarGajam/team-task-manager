import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import AppNavbar from "../components/AppNavbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import TaskBoard from "../components/TaskBoard";

// small CreateProject modal inlined
function CreateProjectModal({ show, onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", description: "" });
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h5>Create Project</h5>
        <input className="form-control my-2" placeholder="Project name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
        <input className="form-control my-2" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onCreate(form); setForm({name:"",description:""}) }}>Create</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // members & users for add member
  const [users, setUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState("");

  // sidebar toggle for small screens
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadProjects = async () => {
    const res = await API.get("/projects");
    setProjects(res.data);
    if (!activeProject && res.data.length > 0) setActiveProject(res.data[0]._id);
  };

  const loadAllUsers = async () => {
    const res = await API.get("/auth/all");
    setUsers(res.data || []);
  };

  const loadProjectMembers = async (id) => {
    const res = await API.get(`/projects/${id}/members`);
    setProjectMembers(res.data || []);
  };

  useEffect(() => {
    loadProjects();
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (activeProject) loadProjectMembers(activeProject);
  }, [activeProject]);

  const createProject = async (payload) => {
    if (!payload.name) return alert("Project name required");
    await API.post("/projects", payload);
    setShowCreateProject(false);
    await loadProjects();
  };

  const addMember = async () => {
    if (!selectedUserToAdd) return alert("Select a user");
    await API.put(`/projects/${activeProject}/add-member`, { userId: selectedUserToAdd });
    setSelectedUserToAdd("");
    await loadProjectMembers(activeProject);
    alert("Member added!");
  };

  // filtered users for dropdown (exclude self & existing members)
  const myId = user?._id;
  const filteredUsers = users.filter(u => u._id !== myId && !projectMembers.some(m => m._id === u._id));

  // get owner id quickly
  const projectOwner = projects.find(p => p._id === activeProject)?.owner;
  const isOwner = projectOwner === myId;

  return (
    <>
      <AppNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="d-flex" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Sidebar - hidden on small screens */}
        <div style={{ width: 280 }} className={`${sidebarOpen ? "" : "d-none d-md-block"}`}>
          <Sidebar
            projects={projects}
            activeProject={activeProject}
            setActiveProject={(id) => { setActiveProject(id); setSidebarOpen(false); }}
            onOpenCreateProject={() => setShowCreateProject(true)}
          />
        </div>

        <main className="flex-grow-1 p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 style={{ marginBottom: 0 }}>{projects.find(p => p._id === activeProject)?.name || "No project selected"}</h4>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {projects.find(p => p._id === activeProject)?.description || ""}
              </div>
            </div>

            <div className="d-flex gap-2 align-items-center">
              {activeProject && (
                <div className="d-flex gap-2 align-items-center">
                  <div>
                    <strong>Members:</strong>
                    <div className="d-inline-block ms-2" style={{ fontSize: 13 }}>
                      {projectMembers.map(m => m.name).join(", ") || "—"}
                    </div>
                  </div>

                  {isOwner && (
                    <div className="d-flex align-items-center gap-2">
                      <select className="form-select form-select-sm" style={{ width: 200 }} value={selectedUserToAdd} onChange={e => setSelectedUserToAdd(e.target.value)}>
                        <option value="">Select user to add</option>
                        {filteredUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                      </select>
                      <button className="btn btn-sm btn-primary" onClick={addMember}>Add</button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateProject(true)}>New Project</button>
              </div>
            </div>
          </div>

          {activeProject ? (
            <TaskBoard projectId={activeProject} />
          ) : (
            <div className="p-4 bg-white rounded shadow-sm">
              <p>Select or create a project to start.</p>
              <button className="btn btn-primary" onClick={() => setShowCreateProject(true)}>Create Project</button>
            </div>
          )}
        </main>
      </div>

      <CreateProjectModal show={showCreateProject} onClose={() => setShowCreateProject(false)} onCreate={createProject} />
    </>
  );
}
