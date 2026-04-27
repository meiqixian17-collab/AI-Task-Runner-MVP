import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import stepRoutes from "./routes/stepRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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
