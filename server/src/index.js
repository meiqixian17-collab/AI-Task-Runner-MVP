import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import stepRoutes from "./routes/stepRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const LOCAL_CLIENT_ORIGIN = "http://localhost:5173";
const defaultOrigins =
  process.env.NODE_ENV === "production" ? [] : [LOCAL_CLIENT_ORIGIN];
const allowedOrigins = [...defaultOrigins, process.env.CLIENT_ORIGIN].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    }
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "server is running"
  });
});

app.use("/api", stepRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
