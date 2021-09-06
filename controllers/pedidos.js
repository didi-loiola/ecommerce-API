const mysql = require('../mysql').pool;

exports.getPedidos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `select pedidos.id_pedidos,
                    pedidos.quantidade,
                    produtos.id_produtos,
                    produtos.nome,
                    produtos.preco
               from pedidos
         inner join produtos
                on  produtos.id_produtos = pedidos.id_produtos`,
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    pedidos: result.map(pedido => {
                        return {
                            id_pedido: pedido.id_pedidos,
                            quantidade: pedido.quantidade,
                            produto: {
                                id_produto: pedido.id_produtos,
                                nome: pedido.nome,
                                preco: pedido.preco
                            },
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna detalhes de um pedido específico',
                                url: 'http://localhost:3000/pedidos/' + pedido.id_pedidos
                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )
    })
};

exports.postPedidos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('select * from produtos where id_produtos=?', [req.body.id_produto],
            (error, result, field) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Produto não encontrado'
                    })
                }

                conn.query(
                    'INSERT INTO pedidos(id_produtos, quantidade) values (?,?)', [req.body.id_produto, req.body.quantidade],
                    (error, result, field) => {
                        conn.release();

                        if (error) { return res.status(500).send({ error: error, }) }
                        const response = {
                            mensagem: 'Pedido inserido com sucesso',
                            pedidoCriado: {
                                id_pedido: result.id_pedidos,
                                id_produto: req.body.id_produtos,
                                quantidade: req.body.nome,
                                request: {
                                    tipo: 'POST',
                                    descricao: 'Insere um pedido',
                                    url: 'http://localhost:3000/pedidos/'
                                }
                            }
                        }
                        return res.status(201).send(response)
                    }
                )
            })
    })
};

exports.getPedidoUnico = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'select * from pedidos where id_pedidos=?;', [req.params.id_pedido],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }

                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado pedido com esse id.'
                    })
                }
                const response = {
                    pedido: {
                        id_pedido: result[0].id_pedidos,
                        id_produto: result[0].id_produtos,
                        quantidade: result[0].quantidade,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna um pedido',
                            url: 'http://localhost:3000/pedidos/'
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )
    })
};

exports.deletePedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        conn.query(
            `delete from pedidos where id_pedidos= ?`, [req.body.id_pedidos],
            (error, result, field) => {
                conn.release();

                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    messagem: 'Pedido removido com sucesso',
                    request: {
                        tipo: 'DELETE',
                        descricao: 'Apaga um pedido',
                        url: 'http://localhost:3000/produtos/',
                        body: {
                            id_produto: 'String',
                            quantidade: 'Number'
                        }
                    }
                }
                return res.status(201).send(response)
            }
        )
    })
};