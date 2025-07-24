import express from "express";
import cardRouter from './routes/card-routes'
import authRouter from './routes/auth-routes'
import userRouter from './routes/user-routes'
import shareRouter from './routes/share-routes'
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())

app.use('/api/card',cardRouter)
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/share',shareRouter)

app.listen(PORT, () => {
  console.log("Server Started listening on port 3000 🌏");
});
