
// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to database
connectDB();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://warehouse-management-system-frontend.onrender.com/"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/shipments", require("./routes/shippingRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/skus", require("./routes/skuRoutes"));
app.use("/api/bins", require("./routes/binRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/returns", require("./routes/returnRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/receipts", require("./routes/receiptRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});