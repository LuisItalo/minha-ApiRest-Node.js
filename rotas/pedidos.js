const express = require('express');
const router = express.Router();

const PedidosControle = require('../controles/pedidos-controle');


// RETORNA TODOS OS PEDIDOS
router.get('/', PedidosControle.getPedidos);
// INSERE UM PEDIDO
router.post('/', PedidosControle.postPedidos);
//  RETORNA OS DADOS DE UM PEDIDO
router.get('/:idpedidos', PedidosControle.getUmPedido);
// EXCLUI UM PEDIDO
router.delete('/', PedidosControle.deletePedido);

module.exports = router;