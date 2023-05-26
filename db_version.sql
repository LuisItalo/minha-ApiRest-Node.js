-- 25/05
create table if not exists imagens_produtos (
	id_imagem int not null primary key auto_increment,
    idproduto int,
    caminho varchar(255),
    foreign key(idproduto) references produtos (idprodutos)
);