import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";


export default function TaskBoard({ projectId }) {
  const [tasks, setTasks] = useState({
    "To Do": [],
    "In Progress": [],
    "Done": [],
  });

  // Fetch tasks when component loads
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await API.get(`/tasks/${projectId}`);
      const grouped = { "To Do": [], "In Progress": [], "Done": [] };

      res.data.forEach((task) => {
        grouped[task.status].push(task);
      });

      setTasks(grouped);
    };
    fetchTasks();
  }, [projectId]);

  // Handle drag movement
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const srcCol = source.droppableId;
    const destCol = destination.droppableId;

    // If dropped in same column but changed positions → optional
    if (srcCol === destCol && source.index === destination.index) return;

    // Copy tasks
    const newTasks = { ...tasks };
    const dragged = newTasks[srcCol][source.index];

    // remove from source
    newTasks[srcCol].splice(source.index, 1);
    // add to destination
    newTasks[destCol].splice(destination.index, 0, dragged);

    setTasks(newTasks);

    // Update backend
    await API.put(`/tasks/${dragged._id}/status`, {
      status: destCol,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        
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
                        style={{
                          padding: "10px",
                          marginBottom: "10px",
                          background: "white",
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
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
  );
}
