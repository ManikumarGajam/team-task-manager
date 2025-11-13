import "dotenv/config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "team-task-manager-api", ts: new Date().toISOString() });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
})();
