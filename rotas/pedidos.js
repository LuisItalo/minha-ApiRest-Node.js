const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;



// RETORNA TODOS OS PEDIDOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(`SELECT pedidos.idpedidos,
                        pedidos.quantidade,
                        produtos.idprodutos,
                        produtos.nome,
                        produtos.preco
                    FROM pedidos
                INNER JOIN produtos
                    ON produtos.idprodutos = pedidos.idprodutos;`,
            (error, result, fields) => {
                if (error) {return res.status(500).send({error: error})}
                
                const response = {
                    pedidos: result.map(pedido => {
                        return {
                            idpedidos: pedido.idprodutos,
                            quantidade: pedido.quantidade,                            
                            produto: {
                                idprodutos: pedido.idprodutos,
                                nome: pedido.nome,
                                preco: pedido.preco
                            },
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os resultados de um prdido especificos',
                                url: 'http://localhost:3000/pedidos/' + pedido.idpedidos
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )
    })
});


// INSERE UM PEDIDO
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({error: error})}
        conn.query('SELECT * FROM produtos WHERE idprodutos = ?', 
        [req.body.idprodutos],
        (error, result, field) => {            
            if (error) {return res.status(500).send({error: error})}
            if (result.length == 0) {
                return res.status(404).send({
                    mensagem: 'Produto não encontrado'
                })
            } 
            conn.query(
                'INSERT INTO pedidos (idprodutos, quantidade) VALUES (?,?)',
                [req.body.idprodutos, req.body.quantidade],
                (error, result, field) => {
                    conn.release();
                    if (error) {return res.status(500).send({error: error})}
                    const response = {
                        mensagem: 'Pedido inserido com sucesso',
                        pedidoCriado:{
                            idpedidos: result.idpedidos,
                            idprodutos: req.body.idprodutos,
                            quantidade: req.body.quantidade,                        
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna todos os pedidos',
                                url: 'http://localhost:3000/pedidos' 
                            }
                        }
                    }
                    return res.status(201).send(response);
                }
            )
        })
    })    
})

//  RETORNA OS DADOS DE UM PEDIDO
router.get('/:idpedidos', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'SELECT * FROM pedidos WHERE idpedidos = ?;',
            [req.params.idpedidos],
            (error, result, fields) => {
                if (error) {return res.status(500).send({error: error})}

                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado pedido com este ID'
                    })
                }
                const response = {                    
                    pedido:{
                        idpedidos: result[0].idpedidos,
                        idprodutos: result[0].idprodutos,
                        quantidade: result[0].quantidade,                        
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os pedidos',
                            url: 'http://localhost:3000/pedidos' 
                        }
                    }
                }
                return res.status(200).send(response);                
            }
        )
    })
});



// EXCLUI UM PEDIDO
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(  
            `DELETE FROM pedidos WHERE idprodutos = ?;`,
            [req.body.idpedidos],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Pedido removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere um pedido',
                        url: 'http://localhost:3000/pedidos',
                        body: {
                            idprodutos: 'Number',
                            quantidade: 'Number'
                        }
                    }
                }
                return res.status(202).send(response);
            }
        )
    })
})

module.exports = router;