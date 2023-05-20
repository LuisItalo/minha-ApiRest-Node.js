const express = require('express');
const router = express.Router();
const UsuariosControle = require('../controles/usuarios-controle');
 

router.post('/cadastro', UsuariosControle.cadastrarUsuario);
router.post('/login', UsuariosControle.Login )

module.exports = router;