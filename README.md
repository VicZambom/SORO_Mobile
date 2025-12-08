# S.O.R.O. Mobile (Sistema Organizacional para Registros de Ocorrências)

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> Aplicação móvel desenvolvida para o Corpo de Bombeiros Militar de Pernambuco (CBMPE) como parte do Projeto Integrador da Faculdade Senac PE.

## 📋 Sobre o Projeto

O **S.O.R.O. Mobile** é a interface de campo da solução S.O.R.O. Ele foi projetado para permitir que bombeiros e operadores registrem ocorrências, vítimas e dados operacionais em tempo real, diretamente do local do evento.

A aplicação foca em **resiliência e usabilidade**, possuindo um sistema robusto de sincronização offline, garantindo que a operação continue mesmo em áreas sem cobertura de internet.

---

## 🚀 Funcionalidades Principais

* **Autenticação Segura:** Login integrado com a API backend via JWT.
* **Gestão de Ocorrências:**
    * Visualização de ocorrências pendentes (despachadas) e em andamento.
    * Criação de novas ocorrências diretamente pelo app.
    * Atualização de status (Deslocamento, Chegada, Finalização).
* **Geolocalização:**
    * Captura automática de coordenadas GPS.
    * Integração com apps de mapa externos (Google Maps/Waze/Apple Maps) para navegação.
* **Coleta de Evidências:**
    * Captura e upload de fotos da ocorrência.
    * Coleta de assinatura digital de testemunhas/vítimas na tela do dispositivo.
* **Gestão de Vítimas:** Cadastro detalhado de vítimas com triagem (classificação de risco).
* **Modo Offline (SyncContext):**
    * Detecção automática de perda de conexão.
    * Fila de sincronização persistente: os dados salvos offline são enviados automaticamente assim que a conexão é restabelecida.
* **Tempo Real:** Atualizações via **Socket.io** para receber novos despachos instantaneamente.

---

## 🛠️ Tecnologias Utilizadas

A arquitetura do projeto utiliza as melhores práticas modernas do ecossistema React Native:

* **Core:** [React Native](https://reactnative.dev/) com [Expo SDK 50+](https://expo.dev/).
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/) para tipagem estática e segurança.
* **Gerenciamento de Estado & Cache:** [TanStack Query (React Query)](https://tanstack.com/query/latest) para requisições assíncronas eficientes.
* **Estilização:** [twrnc](https://www.npmjs.com/package/twrnc) (Tailwind CSS para React Native).
* **Navegação:** [React Navigation](https://reactnavigation.org/) (Native Stack & Material Top Tabs).
* **Formulários:** [React Hook Form](https://react-hook-form.com/) com validação via [Zod](https://zod.dev/).
* **Armazenamento Local:** `AsyncStorage` e `Expo SecureStore`.
* **Recursos Nativos:**
    * `expo-location` (GPS)
    * `expo-image-picker` (Câmera/Galeria)
    * `react-native-signature-canvas` (Assinatura Digital)
    * `socket.io-client` (WebSockets)

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* [Node.js](https://nodejs.org/) (Versão LTS recomendada, v18 ou superior).
* Gerenciador de pacotes (NPM ou Yarn).
* Dispositivo físico com o app **Expo Go** instalado ou emulador Android/iOS configurado.

---

## 🚀 Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/viczambom/soro_mobile.git](https://github.com/viczambom/soro_mobile.git)
    cd soro_mobile/hello-rn
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuração de Ambiente (.env):**
    O projeto utiliza o `app.config.ts` para gerenciar variáveis. Por padrão, ele aponta para a API de produção no Render. Para desenvolvimento local, você pode alterar a variável `extra.apiUrl` em `app.config.ts` ou configurar um arquivo `.env` (se configurado o suporte):

    *URL Padrão:* `https://api-bombeiros-s-o-r-o.onrender.com`

4.  **Execute o projeto:**
    ```bash
    npx expo start
    ```

5.  **No seu celular:**
    * Abra o app **Expo Go**.
    * Escaneie o QR Code exibido no terminal.

---

## 📂 Estrutura do Projeto

O código fonte está localizado na pasta `src/`:

```src/ 
├── components/      # Componentes reutilizáveis (Card, Header, Input, etc.)
├── config/          # Configurações globais
├── constants/       # Constantes de tema (Cores, Fontes)
├── context/         # Contextos globais (Auth, Socket, Sync/Offline)
├── hooks/           # Custom Hooks (useOcorrencias, useMutations)
├── navigation/      # Configuração de rotas (AppNavigator)
├── screens/         # Telas da aplicação (Login, Dashboard, Detalhes, etc.)
├── services/        # Configuração do Axios (API)
└── types/           # Definições de tipos TypeScript globais
```
---

## 📱 Telas Principais

1.  **Login:** Acesso seguro com credenciais do CBMPE.
2.  **Minhas Ocorrências:** Lista unificada de chamados em andamento e pendentes.
3.  **Detalhes (Pendente):** Informações preliminares e rota para o local.
4.  **Detalhes (Em Andamento):** Painel operacional com abas para Cronograma, Mídia e Vítimas.
5.  **Nova Ocorrência:** Formulário wizard (passo a passo) para abertura de chamados em campo.

---

## 👥 Autores e Créditos

Este é um projeto universitário desenvolvido pela **Equipe S.O.R.O.** da **Turma 44** da **Faculdade Senac PE**.

**Orientadores:**
* Danilo Farias
* Geraldo Gomes
* Marcos Tenorio
* Sônia Gomes

---

**Versão:** 1.0.2
