import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors/HttpError.js";


export const errorHandlerMiddleware: ErrorRequestHandler = (error, req, res, next) => {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
    } else if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Dados de entrada invalidos",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message
            }))
        })
    } else if (error instanceof Error) {
        res.status(500).json({ message: error.message })
    } else {
        res.status(500).json({ message: "erro interno no servidor desconhecido" })
    }
}
