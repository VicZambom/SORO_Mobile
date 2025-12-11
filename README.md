# 🚑 SORO Mobile

Bem-vindo ao repositório oficial do **SORO Mobile**.

Este projeto é uma solução mobile desenvolvida para facilitar o gerenciamento, registro e acompanhamento de ocorrências e atendimentos a vítimas em tempo real. O aplicativo foi construído com foco em performance, usabilidade e robustez, utilizando as melhores práticas do ecossistema **React Native**.

---

## 📱 Acesso e Demonstração

### 🚀 Executar via Expo Go
Para testar a aplicação imediatamente em seu dispositivo móvel (Android ou iOS) utilizando o **Expo Go**, escaneie o QR Code abaixo:

![QR Code do Expo](./hello-rn/assets/soroqrCode.svg)

---

### 🤖 Download (Android)
Para instalar a versão compilada (APK) diretamente em seu dispositivo Android, acesse nossa página de lançamentos (Releases):

[**⬇️ Clique aqui para baixar a versão mais recente**](https://github.com/VicZambom/SORO_Mobile/releases/download/V1.0.0/SoroApp.apk)

Ao clicar, o download do arquivo `SoroApp.apk` será iniciado.

> **Nota:** Certifique-se de permitir a instalação de fontes desconhecidas nas configurações do seu dispositivo.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando uma stack moderna e tipada:

- **Core:** React Native com Expo
- **Linguagem:** TypeScript (Segurança de tipo e escalabilidade)
- **Navegação:** React Navigation (Stack e fluxos complexos)
- **Gerenciamento de Estado & Contextos:**
  - `AuthContext`: Autenticação e persistência de sessão.
  - `SocketContext`: Comunicação em tempo real (WebSockets).
  - `SyncContext`: Sincronização de dados e tratamento offline-first.
  - `ThemeContext`: Gerenciamento de temas e estilização.
- **Integração API:** Axios

--- 

## 📱 Telas Principais

- **Login:** Acesso seguro com credenciais do CBMPE.
- **Minhas Ocorrências:** Lista unificada de chamados em andamento e pendentes.
- **Detalhes (Pendente):** Informações preliminares e rota para o local.
- **Detalhes (Em Andamento):** Painel operacional com abas para Cronograma, Mídia e Vítimas.
- **Nova Ocorrência:** Formulário wizard (passo a passo) para abertura de chamados em campo.

---

## ✨ Funcionalidades Principais

Com base na arquitetura do projeto, o aplicativo oferece:

- **Autenticação Segura:** Login robusto para acesso restrito aos socorristas/usuários.
- **Gestão de Ocorrências:**
  - Criação de novas ocorrências (`NovaOcorrenciaScreen`).
  - Listagem de "Minhas Ocorrências".
  - Detalhamento de status (Pendente vs. Em Andamento).
- **Registro de Vítimas:** Fluxo dedicado para cadastro e triagem de vítimas (`RegistrarVitimaScreen`).
- **Coleta de Assinatura:** Funcionalidade para coleta de assinatura digital diretamente na tela do dispositivo (`ColetarAssinaturaScreen`).
- **Atualizações em Tempo Real:** Uso de Sockets para manter o status das ocorrências sempre atualizado entre a central e o mobile.

---

## 📂 Estrutura do Projeto

A organização do código segue os padrões de Clean Architecture adaptados para React Native:

```text
hello-rn/
├── assets/             # Recursos estáticos (imagens, ícones)
├── src/
│   ├── components/     # Componentes reutilizáveis (Card, Header, Input, Modais)
│   ├── constants/      # Temas e constantes globais
│   ├── context/        # Lógica de estado global (Auth, Socket, Sync, Theme)
│   ├── hooks/          # Custom Hooks (useOcorrencias, etc.)
│   ├── navigation/     # Configuração de rotas
│   ├── screens/        # Telas da aplicação
│   ├── services/       # Configuração de API e endpoints
│   ├── types/          # Definições de tipos TypeScript
│   └── utils/          # Funções utilitárias e storage
├── App.tsx             # Ponto de entrada
└── app.config.ts       # Configuração do Expo 

```
---
## 🚀 Como Rodar o Projeto Localmente

### ⚙️ Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina:
- Node.js (Versão LTS recomendada, v18 ou superior).
- Gerenciador de pacotes (NPM ou Yarn).
- Dispositivo físico com o app Expo Go instalado ou emulador Android/iOS configurado.

---

### 📦 Instalação e Execução
1.Clone o repositório:
```bash
git clone [https://github.com/viczambom/soro_mobile.git](https://github.com/viczambom/soro_mobile.git)
cd soro_mobile/hello-rn 

``` 
2. **Instale as dependências:**
```bash
npm install
# ou
yarn install

```
3. **Configuração de Ambiente:**
O projeto utiliza o arquivo `app.config.ts` para gerenciar variáveis de ambiente. Por padrão, a aplicação aponta para a API de produção hospedada no Render.
Para desenvolvimento local ou testes, você pode alterar a propriedade `extra.apiUrl` diretamente em `app.config.ts`.
URL da API (Produção): https://api-bombeiros-s-o-r-o.onrender.com

4. **Execute o projeto:**
```bash
npx expo start

```

5. **No seu celular:**
- Abra o app Expo Go.
- Escaneie o QR Code exibido no terminal ou na interface do navegador.

---

## 👥 Autores e Créditos
Este é um projeto universitário desenvolvido pela Equipe S.O.R.O., integrante da Turma 44 da Faculdade Senac PE.

### 🎓 Orientadores
- Danilo Farias
- Geraldo Gomes
- Marcos Tenorio
- Sônia Gomes
