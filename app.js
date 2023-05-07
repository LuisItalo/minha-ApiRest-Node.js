const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');


const rotaProdutos = require('./rotas/produtos');
const rotaPedidos = require('./rotas/pedidos');
const rotaUsuaios = require('./rotas/usuarios');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({ extended: false})); //apenas dados simples
app.use(bodyParser.json()); //json de entrada no body

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header', 'Content-Type',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }      
    next();
});

app.use('/produtos', rotaProdutos);
app.use('/pedidos', rotaPedidos);
app.use('/usuarios', rotaUsuaios);


// QUANDO NAO ENCONTRA ROTA, ENTRA AQUI
app.use((req, use, next) => {
    const erro = new Error('Nao encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            menssagem: error.message
        }
    })
});


// app.use('/teste',(req, res, next) => {
//     // http.cat sobre status code
//     res.status(200).send({
//         mensagem: 'OK, Deu certo'
//     });    
// });

module.exports = app;