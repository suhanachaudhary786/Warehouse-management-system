
// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to database
connectDB();

const app = express();

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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