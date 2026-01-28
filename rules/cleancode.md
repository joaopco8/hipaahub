# 🧹 Regras de Clean Code — Padrões de Engenharia SecureScan

JAMAIS CRIE ARUQIVO .MD SEM PERMISSÃO

## 🎯 Propósito
Essas regras definem os **padrões de Clean Code** que devem ser seguidos em todos os projetos do SecureScan.  
O objetivo é garantir **legibilidade, manutenibilidade, segurança e escalabilidade** em todo o código.

---

## 🧩 1. Estrutura e Organização do Código
- Mantenha os arquivos **pequenos e com responsabilidade única** (idealmente até 300 linhas).  
- Cada módulo, classe ou componente deve **fazer apenas uma coisa** e fazê-la bem.  
- Utilize uma **hierarquia de pastas clara**: `/api`, `/core`, `/utils`, `/services`, `/tests`, `/config`, `/types`.  
- Evite aninhamentos profundos; quebre lógicas complexas em funções auxiliares.  
- Inclua sempre um breve comentário ou docstring no topo de cada arquivo explicando seu propósito.

---

## 🧠 2. Convenções de Nomes
- Use **nomes descritivos e claros**. Nunca abrevie sem necessidade.  
- Funções → `verboObjeto` (ex: `buscarRelatorio`, `criarSessaoUsuario`).  
- Variáveis → substantivos que descrevem o dado (ex: `resultadosScan`, `tokenUsuario`).  
- Booleanos → devem soar como perguntas (ex: `estaAtivo`, `temErro`).  
- Constantes → `MAIUSCULAS_COM_UNDERSCORES`.  
- Evite nomes genéricos como `data`, `info`, `temp`.

---

## ⚙️ 3. Funções e Métodos
- Mantenha funções **curtas** — no máximo 20 a 25 linhas.  
- Uma função deve executar **apenas uma tarefa lógica**.  
- Prefira **retornos antecipados** a estruturas condicionais aninhadas.  
- Evite efeitos colaterais — funções não devem alterar estados globais.  
- Limite a 3 parâmetros por função sempre que possível (use objetos quando necessário).  
- Inclua **tipagem** e **docstrings** explicando entradas e saídas.

---

## 🧾 4. Comentários e Documentação
- O código deve ser **autoexplicativo**. Comentários são para contexto, não repetição.  
- Use comentários apenas quando a lógica não for evidente.  
- Nunca deixe código comentado. Apague ou registre no controle de versão.  
- Toda função ou classe pública deve ter uma breve descrição.  
- Mantenha a documentação atualizada — comentários desatualizados são piores que nenhum.

---

## 🔄 5. Tratamento de Erros
- Sempre trate erros de forma explícita, nunca silenciosa.  
- Capture exceções apenas onde for possível tratá-las de forma útil.  
- Registre erros com contexto: o que falhou, onde e por quê.  
- Nunca exponha rastros de pilha ou dados sensíveis em respostas públicas.  
- Use um **tratador centralizado de erros** no backend.

---

## 🧱 6. Consistência
- Siga um padrão único de estilo para cada linguagem (PEP8, ESLint, Prettier, etc).  
- Nunca misture espaços e tabs.  
- Mantenha imports organizados: sistema → terceiros → internos.  
- Use o mesmo padrão de aspas, indentação e ponto e vírgula em todo o projeto.  
- **Consistência é mais importante que preferência pessoal.**

---

## 🔐 7. Segurança
- Nunca armazene senhas ou chaves no código — use variáveis de ambiente.  
- Sempre valide e sanitize entradas do usuário.  
- Escape e codifique qualquer saída que interaja com HTML, shell, etc.  
- Use queries parametrizadas (sem interpolar strings em SQL).  
- Mantenha dependências atualizadas e com versões travadas (lockfiles).

---

## 🚀 8. Performance e Escalabilidade
- Evite otimizações prematuras — **meça antes de otimizar**.  
- Faça cache de cálculos custosos quando fizer sentido.  
- Use I/O assíncrono para operações de rede ou arquivos.  
- Limite tamanhos de payloads e use paginação em APIs.  
- Registre métricas de desempenho em pontos críticos.

---

## 🧪 9. Testes
- Todo recurso novo deve ter **testes unitários e de integração**.  
- Nomes de testes devem descrever **o comportamento**, não a implementação.  
- Evite testes frágeis que dependam de detalhes internos.  
- Busque **80% ou mais de cobertura** nos módulos principais.  
- Use **mocks e dados simulados** para chamadas externas (rede, DB).

---

## 🧰 10. Revisão de Código
- Todo PR deve passar por **revisão obrigatória** antes do merge.  
- A revisão deve checar: clareza, segurança, performance e manutenção.  
- Só aceite mudanças que sigam os padrões de nomeação e formatação.  
- Feedbacks devem ser construtivos e educativos.  
- Merge apenas se todos os testes e pipelines estiverem passando.

---

## 🧱 11. Commits e Versionamento
- Cada commit deve representar **uma mudança lógica única**.  
- Mensagens de commit devem ser claras e no imperativo:
  - ✅ `fix: tratar resposta nula no parser do scan`
  - ❌ `update coisas`
- Nunca suba senhas, tokens ou `.env` no repositório.  
- Use nomes de branch descritivos (`feat/engine-scan`, `fix/auth-api`).

---

## 📚 12. Arquitetura
- Respeite a **separação de camadas**: API, lógica de negócio e dados devem ser independentes.  
- Evite dependências circulares.  
- Prefira **composição a herança**.  
- Sempre projete para **injeção de dependência**.  
- Cada módulo deve ser substituível sem quebrar o sistema.

---

## 💬 13. Filosofia Geral
> “Código limpo não é código perfeito — é código claro.”  
- O código deve ser **fácil de ler, entender e modificar**.  
- Escolha **simplicidade em vez de esperteza**.  
- Sempre deixe o código **melhor do que encontrou**.  
- Qualquer engenheiro deve entender seu código em menos de 5 minutos.

---

