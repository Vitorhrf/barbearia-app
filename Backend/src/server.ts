import express from 'express'
import { router } from './router.js'
import { errorHandlerMiddleware } from './middlewares/error-handler.js';

const app = express();
app.use(express.json());
app.use("/api", router)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor iniciado em http://localhost:${PORT}/`))