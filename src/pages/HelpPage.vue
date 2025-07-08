<template>
  <v-card class="mx-auto my-4" max-width="480" elevation="5">
    <v-card-title class="text-h6 text-center">Ajuda</v-card-title>
    <v-card-text>
      <p>Esta aplicação permite gerir vendas de forma simples e rápida. Abaixo encontram-se as principais
        funcionalidades:</p>
      <v-list density="compact" class="bg-transparent">
        <v-list-item variant="tonal" prepend-icon="mdi-cash-register">Registar Venda</v-list-item>
        <v-list-item prepend-icon="mdi-cart-plus">Adicionar vários produtos à venda com quantidades</v-list-item>
        <v-list-item prepend-icon="mdi-tag">Ver preço unitário e subtotal por item</v-list-item>
        <v-list-item prepend-icon="mdi-calculator">Calcular total da venda</v-list-item>
        <v-list-item prepend-icon="mdi-cash-multiple">Introduzir valor dado pelo cliente e calcular troco</v-list-item>
        <v-list-item variant="tonal" prepend-icon="mdi-package-variant">Produtos</v-list-item>
        <v-list-item prepend-icon="mdi-calendar">Nome do Evento</v-list-item>
        <v-list-item prepend-icon="mdi-pencil">Criar, editar e remover produtos</v-list-item>
        <v-list-item prepend-icon="mdi-cash">Definir o valor de venda de cada produto</v-list-item>
        <v-list-item prepend-icon="mdi-lock">Produtos já vendidos permanecem visíveis na lista, mas os botões de editar ou remover ficam
          desabilitados</v-list-item>
        <v-list-item variant="tonal" prepend-icon="mdi-chart-bar">Resumo do Dia</v-list-item>
        <v-list-item prepend-icon="mdi-chart-box-outline">Mostrar totais por produto vendido (quantidade e valor)</v-list-item>
        <v-list-item prepend-icon="mdi-cash">Mostrar total global de vendas do dia</v-list-item>
        <v-list-item prepend-icon="mdi-close">Possibilidade de "Fechar o dia" (limpa as vendas, mantém produtos)</v-list-item>
        <v-list-item variant="plain" prepend-icon="mdi-cloud-off-outline">Aplicação PWA que funciona offline e guarda os dados localmente.</v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
<script setup>
</script>
