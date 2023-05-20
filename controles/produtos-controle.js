const mysql = require('../mysql');


exports.getProdutos = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM produtos;")
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
    } catch (error) {
        return res.status(500).send({error: error});
    }
};

exports.postProduto = async (req, res, next) => {
    try {
        const query = 'INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?,?,?)';        
        const result = await mysql.execute(query, [
            req.body.nome,
            req.body.preco,
            req.file.path
        ]);

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
    } catch (error) {
        return res.status(500).send({ error: error });
    }  
};

exports.getUmProduto = async (req, res, next) => {
    try {
        const query = `SELECT * FROM produtos WHERE idprodutos = ?`;
        const result = await mysql.execute(query, [req.params.idprodutos]);

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
    } catch (error) {
        return res.status(500).send({error: error})
    }
};

exports.updateProduto = async (req, res, next) => {
    try {
        const query =   `UPDATE produtos
                            SET nome     = ?,
                                preco    = ?
                          WHERE idprodutos = ?`;
        await mysql.execute(query, [
            req.body.nome, 
            req.body.preco, 
            req.body.idprodutos
        ]);
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

    } catch (error) {
        return res.status(500).send({error: error})
    }
};

exports.deleteProduto = (req, res, next) => {
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
}