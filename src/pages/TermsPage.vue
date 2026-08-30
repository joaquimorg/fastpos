<template>
  <LegalPageShell eyebrow="Condições de utilização" title="Termos de utilização" :intro="intro" :sections="sections">
    <section id="aceitacao">
      <h2>1. Aceitação dos termos</h2>
      <p>Ao utilizar o fastPOS, o utilizador aceita estes termos e compromete-se a utilizar a aplicação de forma lícita e responsável. Se não concordar com estas condições, deve deixar de utilizar a aplicação.</p>
    </section>

    <section id="servico">
      <h2>2. Natureza do serviço</h2>
      <p>O fastPOS é uma ferramenta de apoio ao registo de vendas, devoluções, valores recebidos e resumos diários. Funciona prioritariamente no navegador ou como aplicação web instalada e pode ser utilizada sem criar uma conta fastPOS.</p>
      <div class="legal-highlight"><v-icon icon="mdi-receipt-text-remove-outline" size="24" /><p>O fastPOS não é um programa de faturação certificado. Os talões e relatórios gerados não constituem faturas, recibos fiscais ou documentos com valor legal.</p></div>
    </section>

    <section id="responsabilidades">
      <h2>3. Responsabilidades do utilizador</h2>
      <p>Compete ao utilizador:</p>
      <ul>
        <li>confirmar a exatidão dos produtos, preços, quantidades e valores registados;</li>
        <li>cumprir as obrigações fiscais, contabilísticas e legais aplicáveis à sua atividade;</li>
        <li>proteger o acesso ao dispositivo e à conta Google utilizada;</li>
        <li>confirmar que os dias pendentes foram sincronizados e manter cópias adequadas dos relatórios;</li>
        <li>não utilizar a aplicação para fins ilícitos, fraudulentos ou que prejudiquem terceiros.</li>
      </ul>
    </section>

    <section id="dados">
      <h2>4. Armazenamento local e cópias de segurança</h2>
      <p>Os dados operacionais são guardados localmente no dispositivo. A limpeza dos dados do navegador, a reposição do dispositivo, a desinstalação da aplicação ou certas configurações de privacidade podem eliminar essa informação.</p>
      <p>A sincronização com Google Sheets é opcional e destina-se a criar uma cópia funcional dos resumos diários. O utilizador deve verificar regularmente o estado de sincronização, especialmente antes de substituir ou apagar o dispositivo.</p>
    </section>

    <section id="google">
      <h2>5. Serviços Google</h2>
      <p>A funcionalidade Google Sheets depende de serviços fornecidos pela Google e de autorização concedida pelo utilizador. A disponibilidade, autenticação e armazenamento no Google Drive estão também sujeitos aos <a href="https://policies.google.com/terms?hl=pt-PT" target="_blank" rel="noopener noreferrer">Termos de Utilização da Google</a>.</p>
      <p>O fastPOS não controla interrupções, limites, alterações ou bloqueios aplicados pela Google ou pelo administrador de uma conta Google Workspace.</p>
    </section>

    <section id="disponibilidade">
      <h2>6. Disponibilidade e alterações</h2>
      <p>A aplicação é disponibilizada tal como se encontra. Poderão existir interrupções para manutenção, correção de erros, atualizações de segurança ou alterações de serviços externos. Funcionalidades podem ser modificadas ou descontinuadas quando necessário.</p>
    </section>

    <section id="responsabilidade">
      <h2>7. Limitação de responsabilidade</h2>
      <p>Na medida permitida pela lei aplicável, o responsável pelo fastPOS não responde por perdas decorrentes de dados introduzidos incorretamente, eliminação de armazenamento local, falhas do dispositivo, indisponibilidade de internet ou de serviços externos, nem pela utilização dos relatórios como documentos fiscais.</p>
      <p>Nada nestes termos exclui direitos ou responsabilidades que não possam ser legalmente excluídos, nomeadamente os direitos imperativos dos consumidores.</p>
    </section>

    <section id="propriedade">
      <h2>8. Propriedade e utilização</h2>
      <p>A marca, apresentação e componentes do fastPOS permanecem protegidos pelos direitos aplicáveis. O código disponibilizado com uma licença de software livre pode ser utilizado nos termos dessa licença, sem que tal conceda direitos sobre marcas ou identidades visuais de terceiros.</p>
    </section>

    <section id="lei">
      <h2>9. Alterações e lei aplicável</h2>
      <p>Estes termos podem ser atualizados para refletir alterações funcionais ou legais. A versão em vigor é identificada pela data apresentada no início da página.</p>
      <p>Os termos são regidos pela lei portuguesa, sem prejuízo das normas imperativas aplicáveis e dos direitos dos consumidores relativamente ao foro competente.</p>
    </section>
  </LegalPageShell>
</template>

<script setup>
import LegalPageShell from '../components/LegalPageShell.vue'
const intro = 'Estas condições definem o uso responsável do fastPOS e os limites de uma aplicação concebida para registo operacional, funcionamento offline e relatórios opcionais no Google Sheets.'
const sections = [
  { id: 'aceitacao', label: 'Aceitação' }, { id: 'servico', label: 'O serviço' },
  { id: 'responsabilidades', label: 'Responsabilidades' }, { id: 'dados', label: 'Dados e cópias' },
  { id: 'google', label: 'Serviços Google' }, { id: 'disponibilidade', label: 'Disponibilidade' },
  { id: 'responsabilidade', label: 'Limitações' }, { id: 'propriedade', label: 'Propriedade' },
  { id: 'lei', label: 'Lei aplicável' },
]
</script>
