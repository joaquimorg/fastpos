# fastPOS

https://fastpos.joaquim.pt/

Sistema de Registo de Vendas moderno, desenvolvido em Vue 3 com Vuetify 3, 100% funcional offline (PWA).

## Funcionalidades

### Produtos

* Criar, editar e remover produtos
* Definir o valor de venda de cada produto
* Produtos já vendidos permanecem visíveis na lista, mas os botões de editar ou remover ficam desabilitados

### Registar Venda

* Adicionar vários produtos à venda com quantidades (incluindo negativas para trocas/devoluções)
* Ver preço unitário e subtotal por item
* Calcular total da venda
* Introduzir valor dado pelo cliente e calcular troco
* Guardar registos de vendas com número sequencial

### Resumo do Dia

* Mostrar totais por produto vendido (quantidade e valor)
* Mostrar total global de vendas do dia
* Fechar e arquivar o dia em segurança no dispositivo
* Criar ou atualizar uma aba diária num relatório Google Sheets do próprio utilizador
* Manter uma fila local quando não existe internet ou autorização Google

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
copy .env.example .env.local
npm run dev
```

> A aplicação estará disponível em [http://localhost:8080](http://localhost:8080)

## Google Sheets

Para ativar os relatórios Google Sheets:

1. Crie um projeto no Google Cloud e ative a **Google Sheets API**.
2. Configure o ecrã de consentimento OAuth e publique a aplicação para utilizadores externos.
3. Adicione apenas o âmbito `https://www.googleapis.com/auth/drive.file`.
4. Crie um cliente OAuth do tipo **Aplicação Web**.
5. Adicione as origens JavaScript autorizadas, por exemplo `http://localhost:8080` e `https://fastpos.joaquim.pt`.
6. Coloque o ID público do cliente em `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
```

Não é necessário nem deve ser configurado um *client secret* no frontend. O ID do relatório, o estado da sincronização e os dias pendentes ficam guardados apenas no dispositivo do utilizador.

## Deploy como PWA

1. Executa:

```bash
npm run build
```

2. Serve a pasta `dist/` com um servidor como Nginx ou Apache.

### Apache e URLs diretos

O build inclui um ficheiro `.htaccess` que encaminha rotas da aplicação, como `/privacidade`, `/termos` e `/resumo`, para o `index.html`. Ao publicar, confirme que os ficheiros ocultos são copiados para o servidor.

O `VirtualHost`/diretório Apache tem de permitir esta configuração, por exemplo:

```apache
<Directory /caminho/para/fastpos/dist>
    AllowOverride Indexes
    Require all granted
</Directory>
```

Se o servidor não permitir `.htaccess`, adicione diretamente ao `VirtualHost`:

```apache
FallbackResource /index.html
```


## Temas e Estilo

* Tema personalizado moderno com tipografia Outfit e Work Sans

> Este projeto é open-source. Sinta-se à vontade para modificar e adaptar às suas necessidades.
