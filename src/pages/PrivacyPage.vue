<template>
  <LegalPageShell eyebrow="Transparência" title="Política de privacidade" :intro="intro" :sections="sections">
    <section id="ambito">
      <h2>1. Âmbito e responsável</h2>
      <p>Esta política explica como o fastPOS trata informação quando é utilizado através de <strong>fastpos.joaquim.pt</strong>. O fastPOS é uma aplicação de ponto de venda que funciona prioritariamente no dispositivo do utilizador e pode, por opção deste, criar relatórios no seu próprio Google Drive.</p>
      <p>Para questões sobre privacidade ou sobre o funcionamento da aplicação, pode utilizar o contacto de suporte apresentado no ecrã de autorização Google do fastPOS.</p>
    </section>

    <section id="dados-locais">
      <h2>2. Dados guardados no dispositivo</h2>
      <p>Para disponibilizar as suas funcionalidades, o fastPOS guarda localmente no navegador ou na aplicação instalada:</p>
      <ul>
        <li>nome do evento, moeda escolhida, produtos e respetivos preços;</li>
        <li>vendas, devoluções, valores recebidos e troco;</li>
        <li>dias fechados e relatórios que aguardam sincronização;</li>
        <li>identificador e endereço do relatório Google Sheets criado para o utilizador;</li>
        <li>estado e data da última sincronização.</li>
      </ul>
      <div class="legal-highlight"><v-icon icon="mdi-cellphone-lock" size="24" /><p>Estes dados operacionais não são enviados para um servidor fastPOS. Permanecem no dispositivo até serem eliminados pelo utilizador através das definições do navegador ou do dispositivo.</p></div>
    </section>

    <section id="google">
      <h2>3. Ligação opcional ao Google Sheets</h2>
      <p>A ligação a uma conta Google é opcional. Quando o utilizador escolhe “Ligar conta Google”, a Google apresenta o seu próprio ecrã de autenticação e consentimento.</p>
      <p>O fastPOS solicita apenas a permissão <strong>Google Drive file</strong> (<code>drive.file</code>), utilizada para:</p>
      <ul>
        <li>criar um relatório de vendas Google Sheets no Drive do utilizador;</li>
        <li>criar ou atualizar uma aba correspondente a cada dia fechado;</li>
        <li>consultar e editar apenas os ficheiros criados ou expressamente utilizados com o fastPOS.</li>
      </ul>
      <p>Esta permissão não permite ao fastPOS pesquisar ou consultar livremente os restantes documentos do Google Drive. O relatório e os dados nele contidos pertencem à conta Google escolhida pelo utilizador.</p>
    </section>

    <section id="utilizacao">
      <h2>4. Como os dados Google são utilizados</h2>
      <p>Os dados obtidos através das APIs Google são utilizados exclusivamente para disponibilizar a sincronização e o relatório diário visíveis na aplicação. Não são utilizados para publicidade, definição de perfis, avaliação de crédito ou outras finalidades não relacionadas com esta funcionalidade.</p>
      <p>O acesso, utilização, armazenamento e transferência de informação recebida das APIs Google respeitam a <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, incluindo os requisitos de utilização limitada.</p>
    </section>

    <section id="partilha">
      <h2>5. Partilha e serviços externos</h2>
      <p>O fastPOS não vende nem partilha dados de vendas com anunciantes ou intermediários de dados. Quando a sincronização é utilizada, os dados do relatório são transmitidos diretamente pelo navegador para as APIs da Google, mediante autorização do utilizador.</p>
      <p>A aplicação utiliza serviços Google para autenticação, Google Sheets e apresentação de tipos de letra. Estes serviços podem tratar dados técnicos, como endereço IP e informação do navegador, de acordo com as respetivas políticas.</p>
    </section>

    <section id="seguranca">
      <h2>6. Tokens, segurança e conservação</h2>
      <p>O fastPOS não solicita nem conhece a palavra-passe Google. Os tokens de acesso Google são temporários e mantidos apenas durante a sessão necessária à sincronização; não são guardados permanentemente no armazenamento local.</p>
      <p>Os relatórios pendentes permanecem no dispositivo para evitar perda de informação quando não existe internet. Depois de sincronizados, o ficheiro continuará no Google Drive até ser eliminado pelo respetivo proprietário.</p>
    </section>

    <section id="controlo">
      <h2>7. Controlo e eliminação</h2>
      <p>O utilizador pode, a qualquer momento:</p>
      <ul>
        <li>desligar o Google Sheets nas definições do fastPOS;</li>
        <li>revogar a autorização na página de <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">ligações de terceiros da Conta Google</a>;</li>
        <li>eliminar ou mover o relatório diretamente no Google Drive;</li>
        <li>eliminar os dados locais limpando os dados do site ou desinstalando a aplicação.</li>
      </ul>
      <p>Desligar a conta no fastPOS não elimina o relatório já existente no Google Drive.</p>
    </section>

    <section id="alteracoes">
      <h2>8. Alterações a esta política</h2>
      <p>Esta política poderá ser atualizada quando as funcionalidades ou os requisitos legais mudarem. A data da versão em vigor é apresentada no início da página. Alterações materiais à utilização de dados Google serão comunicadas antes de esses dados serem utilizados para uma nova finalidade.</p>
    </section>
  </LegalPageShell>
</template>

<script setup>
import LegalPageShell from '../components/LegalPageShell.vue'
const intro = 'O fastPOS foi concebido para manter as vendas sob o controlo de quem utiliza o dispositivo. Esta página explica, em linguagem clara, o que é guardado localmente e o que acontece ao ligar o Google Sheets.'
const sections = [
  { id: 'ambito', label: 'Âmbito' }, { id: 'dados-locais', label: 'Dados locais' },
  { id: 'google', label: 'Google Sheets' }, { id: 'utilizacao', label: 'Utilização' },
  { id: 'partilha', label: 'Partilha' }, { id: 'seguranca', label: 'Segurança' },
  { id: 'controlo', label: 'Controlo' }, { id: 'alteracoes', label: 'Alterações' },
]
</script>
