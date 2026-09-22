const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const progressRoutes = require("./routes/progressRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");


const { protect } = require("./middleware/authMiddleware");

const app = express();

connectDB();

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/modules", moduleRoutes);

app.use("/api/lessons", lessonRoutes);

app.use("/api/assessments", assessmentRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/results", resultRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", adminRoutes);
// ⭐ NEW: ANALYTICS ROUTES
app.use("/api/analytics", analyticsRoutes);

// ==========================================
// PROTECTED TEST ROUTE
// ==========================================

app.get(
    "/api/protected",
    protect,
    (req, res) => {
        res.json({
            message:
                "You accessed a protected route! 🔐",
            user: req.user
        });
    }
);

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message:
            "Welcome to LearnSphere API 🚀"
    });
});

// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `LearnSphere server running on port ${PORT}`
        );
    }
);