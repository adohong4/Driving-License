import express from "express";
import dotenv from "dotenv";
import licenseRoutes from "./routes/licenseRoutes";
import { connectDB } from "./utils/mongodb";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/licenses", licenseRoutes);

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
});