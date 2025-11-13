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
  const [activeTask, setActiveTask] = useState(null); // <-- NEW

  // reusable fetch method
  const refreshTasks = async () => {
    const res = await API.get(`/tasks/${projectId}`);
    const grouped = { "To Do": [], "In Progress": [], "Done": [] };

    res.data.forEach((task) => {
      grouped[task.status].push(task);
    });

    setTasks(grouped);
  };

  // load tasks on mount / project change
  useEffect(() => {
    refreshTasks();
  }, [projectId]);

  // Drag handler
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const srcCol = source.droppableId;
    const destCol = destination.droppableId;

    if (srcCol === destCol && source.index === destination.index) return;

    const newTasks = { ...tasks };
    const dragged = newTasks[srcCol][source.index];

    // remove + insert
    newTasks[srcCol].splice(source.index, 1);
    newTasks[destCol].splice(destination.index, 0, dragged);

    setTasks(newTasks);

    // sync backend
    await API.put(`/tasks/${dragged._id}/status`, {
      status: destCol,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Create Task Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          marginBottom: "15px",
          padding: "8px 12px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        + Create Task
      </button>

      {/* Create Task Modal */}
      {showModal && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowModal(false)}
          refresh={refreshTasks}
        />
      )}

      {/* Task Details Modal */}
      {activeTask && (
        <TaskDetailsModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          refresh={refreshTasks}
        />
      )}

      {/* Drag and Drop Board */}
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

                  {tasks[col].map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          onClick={() => setActiveTask(task)} // <-- OPEN MODAL
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
