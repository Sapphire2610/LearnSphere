const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const existingAdmin = await User.findOne({
            email: "admin@learnsphere.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            10
        );

        const admin = await User.create({
            name: "LearnSphere Admin",
            email: "admin@learnsphere.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully!");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();