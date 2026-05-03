# 🟡 TAKESTREET | Urban Curation & Systems Architecture

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stack-Flask%20%7C%20Python%20%7C%20JS-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Culture-Streetwear%20%7C%20Trap%20%7C%20Hip--Hop-black?style=for-the-badge" />
</p>

---

## ⚡ A Proposta (The Vision)
O **TAKESTREET** não é apenas um template de e-commerce; é uma plataforma de curadoria streetwear que reflete a cultura **Trap, Hip-Hop e Boombap brasileiro** através de uma interface digital de alto impacto. 

O projeto nasce da necessidade de unir a estética urbana "sem filtro" com uma arquitetura de software estruturada, focada em organização, performance e escalabilidade.

---

## 🏗️ Arquitetura de Sistemas & Engenharia
O TAKESTREET é estruturado como um laboratório de conceitos de sistemas, com foco na separação de responsabilidades e na evolução incremental controlada via Git.

### 💻 Backend Core
*   **Flask (Micro-framework)**: Utilizado pela flexibilidade em servir rotas e pela facilidade de evolução para uma arquitetura de API.
*   **Modular Routing**: Gerenciamento centralizado de rotas no `app.py`, facilitando a manutenção e o processo de debug.
*   **Environment Reproducibility**: Controle rigoroso de dependências via `requirements.txt`, garantindo consistência total entre diferentes ambientes de desenvolvimento.

### 🎨 Frontend & UX Strategy
*   **Identidade Visual**: Tema escuro com tipografia pesada e elementos em amarelo, profundamente inspirado na sinalização e estética urbana.
*   **UX-Driven Design**: Fluxo de navegação desenhado para reduzir a fricção entre a jornada de *descoberta* → *interesse* → *ação* (wishlist).
*   **Responsividade**: Layout adaptável para múltiplos dispositivos, mantendo a consistência visual e agressividade da marca.

---

## 🤖 Liderança Técnica com IA (AI Orchestration)
O projeto atua como um experimento em **desenvolvimento orientado por Inteligência Artificial**, demonstrando competência em direção técnica assistida:

*   **Prompt Engineering**: Uso estruturado e avançado de prompts para geração de lógica, refatoração de código complexo e resolução de bugs.
*   **Apoio em Decisão Técnica**: Utilização de modelos de linguagem como suporte estratégico para decisões de arquitetura e organização de arquivos.
*   **Eficiência de Desenvolvimento**: Otimização do tempo em tarefas repetitivas (boilerplate) e aceleração do ciclo de iteração.

---

## 📂 Organização do Projeto
```bash
/takestreet
 ├── app.py              # Core: rotas, lógica do servidor e configuração
 ├── requirements.txt    # Dependências do projeto (pip install -r)
 ├── /templates          # Templates HTML (Renderização via Jinja2)
 │   └── index.html      # Estrutura principal da aplicação
 └── /static             # Ativos estáticos servidos pelo Flask
     ├── /css            # Estilização customizada (Urban style)
     └── /js             # Interatividade e lógica de interface cliente

---

🚀 Roadmap de Evolução

    [ ] Data Persistence: Implementação e integração com base de dados PostgreSQL.

    [ ] Security Layer: Sistema de autenticação robusto utilizando JWT (JSON Web Tokens).

    [ ] API Economy: Transição para uma API REST totalmente desacoplada.

    [ ] DevOps: Configuração de pipeline CI/CD e automação de deploy.

👨‍💻 Autor & Direção Técnica

Arthur Felipe (Take)

Estudante de Sistemas de Informação — UNEB (3º semestre)

Focado em desenvolvimento Web, arquitetura de sistemas e na aplicação da tecnologia como uma extensão da cultura urbana e da experiência do usuário.
