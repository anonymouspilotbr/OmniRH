const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");

router.post("/cadastrar", empresaController.cadastrar);
router.get("/listar", empresaController.listar);
router.get("/:id", empresaController.buscarPorId);
router.put("/:id", empresaController.atualizar);
router.delete("/:id", empresaController.remover);

module.exports = router;
