Team Task Manager (Trello-Lite)

A lightweight team task management app with JWT authentication, projects, tasks, members, and a Kanban board.

🚀 Tech Stack

Frontend: React, Context API/Redux, react-beautiful-dnd
Backend: Node.js, Express
Database: MongoDB
Auth: JWT Authentication

⚙ Installation

1️⃣ Clone the repository

git clone <your-repo-url> 

▶ Backend Setup

cd backend npm install 
Create a .env file inside backend:
MONGO_URI=your_mongo_uri JWT_SECRET=your_jwt_secret PORT=5000 
Run backend:
npm start 

🎨 Frontend Setup

cd frontend npm install npm run dev 

📌 Features Implemented

User signup & login (JWT)

Create/update/delete projects

Add tasks under projects

Drag & drop tasks between columns

Assign tasks to members

Role-based access on backend

Kanban-style task board

🧠 Assumptions & Notes

Only project members can modify tasks.

UI responsiveness partially completed due to time constraint.
