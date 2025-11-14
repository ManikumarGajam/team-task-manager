import { useEffect, useState } from "react";
import API from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";

export default function TaskBoard({ projectId }) {
  const [tasks, setTasks] = useState({ "To Do": [], "In Progress": [], "Done": [] });
  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const refreshTasks = async () => {
    const res = await API.get(`/tasks/${projectId}`);
    const grouped = { "To Do": [], "In Progress": [], "Done": [] };
    res.data.forEach(task => grouped[task.status].push(task));
    setTasks(grouped);
  };

  useEffect(() => { if (projectId) refreshTasks(); }, [projectId]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const src = source.droppableId, dst = destination.droppableId;
    if (src === dst && source.index === destination.index) return;

    const copy = { ...tasks };
    const [moved] = copy[src].splice(source.index, 1);
    copy[dst].splice(destination.index, 0, moved);
    setTasks(copy);
    await API.put(`/tasks/${moved._id}/status`, { status: dst });
  };

  const getVisible = (col) => tasks[col].filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
                                    .filter(t => statusFilter ? t.status === statusFilter : true);

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Task</button>
      </div>

      {showModal && <CreateTaskModal projectId={projectId} onClose={() => setShowModal(false)} refresh={refreshTasks} />}

      {activeTask && <TaskDetailsModal task={activeTask} onClose={() => setActiveTask(null)} refresh={refreshTasks} />}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {["To Do", "In Progress", "Done"].map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div className="column" ref={provided.innerRef} {...provided.droppableProps}>
                  <h5>{col}</h5>
                  {getVisible(col).map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(prov) => (
                        <div className="task-card" ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} onClick={() => setActiveTask(task)}>
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                          <div style={{ fontSize: 13, marginTop: 6, color: "var(--muted)" }}>{task.description}</div>
                          <div className="meta">Assigned: {task.assignee?.name || "Unassigned"}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
