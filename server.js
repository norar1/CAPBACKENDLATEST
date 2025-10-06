import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import AccountRoute from "./routes/account.js"
import FireStationBusinessfsicRoute from "./routes/businessfsic.js"
import BuildingRoute from "./routes/Building.js"
import OccupancyRoute from "./routes/Occupancy.js"
import FireCasesRoute from "./routes/FireCases.js"
import cors from "cors"

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    "https://lubao-firestation.netlify.app",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/account/firestation", AccountRoute)
app.use("/api/businessfsic/data", FireStationBusinessfsicRoute)
app.use("/api/building", BuildingRoute)
app.use("/api/occupancy", OccupancyRoute)
app.use("/api/firecases", FireCasesRoute)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  connectDB()
})
//test
