
import { Router } from "express";
import * as comentariosController from "../controllers/commentsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, comentariosController.create);
router.get("/:notaId", authMiddleware, comentariosController.getComentariosByNota);
router.put("/:id", authMiddleware, comentariosController.updateComentario);
router.delete("/:id", authMiddleware, comentariosController.deleteComentario);

export default router;