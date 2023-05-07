const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);        
    } else{
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// RETORNA TODOS OS PRODUTOS
router.get('/', (req, res, next) => {
    // res.status(200).send({
    //     mensagem: 'Retorna todos  os pedidos'
    // })

    mysql.getConnection((error,conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'SELECT * FROM produtos',
            (error, result, fields) => {
                if (error) {return res.status(500).send({error: error})}
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            idprodutos: prod.idprodutos,
                            nome: prod.nome,
                            preco: prod.preco,
                            imagem_produto: prod.imagem_produto,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os resultados de produtos especificos',
                                url: 'http://localhost:3000/produtos/' + prod.idprodutos
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )
    })
});


// INSERE UM PRODUTO
router.post('/', upload.single('produto_imagem'), (req, res, next) => {
   console.log(req.file); 
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?,?,?);',
            [
                req.body.nome,
                req.body.preco,
                req.file.path
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto inserido com sucesso',
                    produtoCriado:{
                        idprodutos: result.idprodutos,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        imagem_produto: req.file.path,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos' 
                        }
                    }
                }
                return res.status(201).send(response);
            }
        )
    });    
});

//  RETORNA OS DADOS DE UM PRODUTO
router.get('/:idprodutos', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(
            'SELECT * FROM produtos WHERE idprodutos = ?;',
            [req.params.idprodutos],
            (error, result, fields) => {
                if (error) {return res.status(500).send({error: error})}

                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado produto com este ID'
                    })
                }
                const response = {                    
                    produto:{
                        idprodutos: result[0].idprodutos,
                        nome: result[0].nome,
                        preco: result[0].preco,
                        imagem_produto: result[0].imagem_produto,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos' 
                        }
                    }
                }
                return res.status(200).send(response);                
            }
        )
    })
});

// ALTERA UM PRODUTO
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(  
            `UPDATE produtos
                SET nome     = ?,
                    preco    = ?
            WHERE idprodutos = ?;`,
            [
                req.body.nome, 
                req.body.preco, 
                req.body.idprodutos
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto atualizado com sucesso',
                    produtoAtualizado:{
                        idprodutos: req.body.idprodutos,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna os detalhes de um produto especifico',
                            url: 'http://localhost:3000/produtos/' + req.body.idprodutos 
                        }
                    }
                }
                return res.status(202).send(response);                
            }
        )
    })
})

// EXCLUI UM PRODUTO
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error: error})}
        conn.query(  
            `DELETE FROM produtos WHERE idprodutos = ?;`,
            [req.body.idprodutos],
            (error, resultado, field) => {
                conn.release();
                if (error) { return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere um produto',
                        url: 'http://localhost:3000/produtos',
                        body: {
                            nome: 'String',
                            preco: 'Number'
                        }
                    }
                }
                return res.status(202).send(response);
            }
        )
    })
})

module.exports = router;