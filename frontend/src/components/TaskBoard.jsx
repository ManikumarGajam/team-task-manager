import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";

export default function TaskBoard({ projectId }) {
  const [tasks, setTasks] = useState({
    "To Do": [],
    "In Progress": [],
    "Done": [],
  });

  const [showModal, setShowModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // NEW: search + filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Reusable fetch method
  const refreshTasks = async () => {
    const res = await API.get(`/tasks/${projectId}`);
    const grouped = { "To Do": [], "In Progress": [], "Done": [] };

    res.data.forEach((task) => {
      grouped[task.status].push(task);
    });

    setTasks(grouped);
  };

  useEffect(() => {
    refreshTasks();
  }, [projectId]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const srcCol = source.droppableId;
    const destCol = destination.droppableId;

    if (srcCol === destCol && source.index === destination.index) return;

    const newTasks = { ...tasks };
    const dragged = newTasks[srcCol][source.index];

    newTasks[srcCol].splice(source.index, 1);
    newTasks[destCol].splice(destination.index, 0, dragged);

    setTasks(newTasks);

    await API.put(`/tasks/${dragged._id}/status`, {
      status: destCol,
    });
  };

  // FILTER TASKS FOR DISPLAY
  const getVisibleTasks = (col) => {
    return tasks[col]
      .filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((t) => (statusFilter ? t.status === statusFilter : true));
  };

  return (
    <div style={{ padding: "20px" }}>
      
      {/* TOP BAR: Search + Filter + Create Task */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        
        {/* SEARCH */}
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        {/* CREATE BUTTON */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 14px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Task
        </button>
      </div>

      {/* CREATE TASK MODAL */}
      {showModal && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowModal(false)}
          refresh={refreshTasks}
        />
      )}

      {/* TASK DETAILS MODAL */}
      {activeTask && (
        <TaskDetailsModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          refresh={refreshTasks}
        />
      )}

      {/* KANBAN BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px" }}>
          {["To Do", "In Progress", "Done"].map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    background: "#f4f4f4",
                    padding: "10px",
                    width: "300px",
                    minHeight: "400px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ textAlign: "center" }}>{col}</h3>

                  {getVisibleTasks(col).map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setActiveTask(task)}
                          style={{
                            padding: "10px",
                            marginBottom: "10px",
                            background: "white",
                            borderRadius: "6px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            cursor: "pointer",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <strong>{task.title}</strong>
                          <p style={{ fontSize: "12px", opacity: 0.7 }}>
                            {task.description}
                          </p>
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
