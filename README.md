# fastPOS

https://fastpos.joaquim.pt/

Sistema de Registo de Vendas moderno, desenvolvido em Vue 3 com Vuetify 3, 100% funcional offline (PWA).

## Funcionalidades

### Produtos

* Criar, editar e remover produtos
* Definir o valor de venda de cada produto
* Produtos já vendidos permanecem visíveis na lista, mas os botões de editar ou remover ficam desabilitados

### Registar Venda

* Adicionar vários produtos à venda com quantidades
* Ver preço unitário e subtotal por item
* Calcular total da venda
* Introduzir valor dado pelo cliente e calcular troco
* Guardar registos de vendas com número sequencial

### Resumo do Dia

* Mostrar totais por produto vendido (quantidade e valor)
* Mostrar total global de vendas do dia
* Possibilidade de "Fechar o dia" (limpa as vendas, mantém produtos)

### Outros

* Interface responsivo para desktop e mobile
* PWA (instalável em Android, iOS e desktop)
* Dados guardados localmente no browser

## Tecnologias

* [Vue 3](https://vuejs.org/)
* [Vite](https://vitejs.dev/)
* [Vuetify 3](https://vuetifyjs.com/)

## Instalação Local

```bash
npm install
npm run dev
```

> A aplicação estará disponível em [http://localhost:8080](http://localhost:8080)

## Deploy como PWA

1. Executa:

```bash
npm run build
```

2. Serve a pasta `dist/` com um servidor como Nginx ou Apache.


## Temas e Estilo

* Tema personalizado moderno com cores vibrantes e tipografia Inter

> Este projeto é open-source. Sinta-se à vontade para modificar e adaptar às suas necessidades.
