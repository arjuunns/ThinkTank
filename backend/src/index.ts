import express from "express";
import cardRoutes from './routes/card-routes'
import authRoutes from './routes/auth-routes'
import userRoutes from './routes/user-routes'
const app = express();


app.use(express.json())

app.use('/api/card',cardRoutes)
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)

app.listen(3000, () => {
  console.log("Server Started listening on port 3000 🌏");
});
