import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import TaskBoard from "../components/TaskBoard";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await API.get("/projects");
      setProjects(res.data);
      setActiveProject(res.data[0]?._id);
    };
    load();
  }, []);

  return (
    <div>
      <h2>Welcome {user?.name}</h2>
      <button onClick={logout}>Logout</button>

      <h3>Your Projects</h3>

      <select onChange={(e) => setActiveProject(e.target.value)}>
        {projects.map((p) => (
          <option value={p._id} key={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <hr />

      {activeProject ? (
        <TaskBoard projectId={activeProject} />
      ) : (
        <p>No project selected</p>
      )}
    </div>
  );
}
