# 🔐 PassVault

> Gerenciador de senhas local, seguro e offline — construído com Electron, React e criptografia de nível militar.

![PassVault Banner](https://img.shields.io/badge/PassVault-1.0.0-teal?style=for-the-badge&logo=shield&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-28-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)

---

## 📖 Sobre o Projeto

O **PassVault** é um gerenciador de senhas **100% local e offline**, desenvolvido como uma aplicação desktop com Electron. Nenhuma senha é enviada para servidores externos — tudo fica armazenado na sua máquina, protegido por múltiplas camadas de criptografia.

O projeto nasceu da necessidade de ter uma solução simples, segura e transparente para gerenciar credenciais sem depender de serviços na nuvem ou assinar planos pagos.

---

## 🛡️ Segurança — O Coração do Projeto

Esta é a parte mais importante do PassVault. Cada decisão arquitetural foi tomada pensando em segurança.

### 🗄️ Armazenamento em Arquivo Binário Criptografado

As senhas **não são armazenadas em texto puro, JSON ou qualquer formato legível**. Todo o cofre é salvo em um único arquivo binário (`data.vault`) cujo conteúdo é completamente ilegível sem a senha mestre correta.

A estrutura interna do arquivo binário é:

```
[ SALT (16 bytes) ][ IV (16 bytes) ][ AUTH TAG (16 bytes) ][ DADOS CIFRADOS ]
```

Cada campo tem uma função específica na cadeia de segurança:

| Campo                           | Tamanho  | Função                                                                   |
| ------------------------------- | -------- | ------------------------------------------------------------------------ |
| **SALT**                        | 16 bytes | Garante que duas criptografias da mesma senha gerem chaves diferentes    |
| **IV** (Vetor de Inicialização) | 16 bytes | Garante que dois arquivos com o mesmo conteúdo gerem binários diferentes |
| **Auth Tag**                    | 16 bytes | Detecta qualquer adulteração no arquivo (integridade)                    |
| **Dados Cifrados**              | variável | O JSON com todas as senhas, completamente cifrado                        |

### 🔑 Derivação de Chave com PBKDF2

A senha mestre do usuário **nunca é usada diretamente** como chave de criptografia. Em vez disso, ela passa por um processo de derivação:

```
Senha Mestre + SALT → PBKDF2 (100.000 iterações, SHA-256) → Chave AES de 256 bits
```

**Por que 100.000 iterações?** Isso torna ataques de força bruta computacionalmente inviáveis. Mesmo que um atacante obtenha o arquivo `.vault`, cada tentativa de senha exige 100.000 cálculos de hash — o que tornaria testar milhões de senhas proibitivamente lento.

### 🔒 Criptografia AES-256-GCM

O algoritmo escolhido foi o **AES-256-GCM** (Advanced Encryption Standard, 256 bits, modo Galois/Counter Mode):

- **AES-256** é o padrão usado por governos e militares para proteger informações classificadas
- **Modo GCM** adiciona autenticação integrada — qualquer modificação no arquivo é detectada automaticamente, prevenindo ataques de adulteração
- Chave de **256 bits** = 2²⁵⁶ combinações possíveis, impossível de quebrar por força bruta

### 🧂 Hash da Senha Mestre com Argon2id

Para verificar o login, a senha mestre é armazenada como um **hash irreversível** usando **Argon2id** — o algoritmo vencedor da Password Hashing Competition (PHC) e considerado o estado da arte em hashing de senhas:

- **Resistente a ataques de GPU**: consome memória RAM propositalmente, o que torna ataques paralelos em GPU muito caros
- **Resistente a ataques de timing**: o modo `id` combina resistência a ataques side-channel
- A senha mestre **nunca é armazenada**, apenas seu hash

### 🔄 Isolamento de Contexto (Electron)

O app usa `contextIsolation: true` e `sandbox: false` com um **preload script** dedicado. Isso significa que o código da interface (renderer) nunca acessa diretamente o sistema de arquivos ou APIs do Node.js — toda comunicação passa por uma camada de IPC (Inter-Process Communication) controlada.

```
[Renderer - React UI] ←→ [IPC Bridge - Preload] ←→ [Main Process - Node.js]
```

### 📦 Backup com Re-criptografia

O sistema de exportação/importação foi projetado com segurança em mente:

- O backup exportado é **criptografado com a senha mestre atual**
- Na importação, é possível informar uma **senha mestre diferente** (de um cofre antigo)
- O sistema descriptografa com a senha antiga e **re-criptografa automaticamente com a senha atual** antes de salvar
- Isso permite restaurar backups mesmo após trocar a senha mestre

---

## ✨ Funcionalidades

- 🔐 **Cofre criptografado** com AES-256-GCM
- 🗝️ **Senha mestre** protegida com Argon2id
- 🎲 **Gerador de senhas** configurável (tamanho, maiúsculas, números, símbolos)
- 🔍 **Busca** em tempo real por site
- ✏️ **Edição** de credenciais salvas
- 📤 **Exportação** de backup criptografado `.enc`
- 📥 **Importação** com suporte a senha mestre diferente
- 🌙 **Modo escuro/claro** com persistência
- 🖥️ **System Tray** — roda em segundo plano, acessível pela bandeja do sistema
- 💾 **100% offline** — nenhum dado sai da sua máquina

---

## 🚀 Tecnologias Utilizadas

### Core

| Tecnologia        | Versão | Uso                  |
| ----------------- | ------ | -------------------- |
| **Electron**      | 28     | Framework desktop    |
| **React**         | 18     | Interface do usuário |
| **electron-vite** | 2      | Build e dev server   |

### Segurança

| Tecnologia           | Uso                                                    |
| -------------------- | ------------------------------------------------------ |
| **Node.js `crypto`** | AES-256-GCM, PBKDF2, geração de IVs e SALTs aleatórios |
| **Argon2id**         | Hashing da senha mestre                                |

### UI

| Tecnologia                | Uso                      |
| ------------------------- | ------------------------ |
| **Tailwind CSS**          | Estilização              |
| **Lucide React**          | Ícones                   |
| **React Hook Form + Zod** | Validação de formulários |

---

## 🏗️ Arquitetura do Projeto

```
electron/
├── src/
│   ├── main/
│   │   └── index.js          # Processo principal: criptografia, IPC handlers, tray
│   ├── preload/
│   │   └── index.js          # Bridge segura entre renderer e main
│   └── renderer/
│       └── src/
│           ├── App.jsx        # Roteamento e estado global de autenticação
│           ├── pages/
│           │   ├── Login.jsx       # Tela de desbloqueio do cofre
│           │   ├── Setup.jsx       # Criação da senha mestre
│           │   ├── Dashboard.jsx   # Lista de senhas
│           │   ├── Generator.jsx   # Gerador de senhas
│           │   └── Settings.jsx    # Exportar/importar backup
│           └── components/
│               ├── Sidebar.jsx         # Navegação lateral
│               ├── PasswordCards.jsx   # Cards de credenciais
│               ├── Darkbutton.jsx      # Toggle de tema
│               └── Resetbutton.jsx     # Reset do cofre
├── resources/
│   ├── PassVault.ico    # Ícone Windows
│   └── PassVault.png    # Ícone tray
└── package.json
```

---

## 🔄 Fluxo de Funcionamento

```
1. PRIMEIRO USO
   └── Usuário define senha mestre
       └── Argon2id gera hash → salvo em master.hash
           └── Cofre vazio criptografado → salvo em data.vault

2. LOGIN
   └── Usuário digita senha mestre
       └── Argon2id verifica contra o hash armazenado
           └── ✅ Correto → senha guardada na sessão (sessionStorage)
           └── ❌ Incorreto → acesso negado

3. OPERAÇÕES NO COFRE
   └── Leitura: data.vault → PBKDF2(senha+salt) → AES-GCM decrypt → JSON
   └── Escrita: JSON → AES-GCM encrypt(novo salt+IV) → data.vault

4. BACKUP
   └── Exportar: cofre atual → encrypt com senha atual → arquivo .enc
   └── Importar: arquivo .enc → decrypt com senha do backup
                             → re-encrypt com senha atual
                             → merge com cofre existente
```

---

## 🖥️ Instalação e Uso

### Pré-requisitos

- Node.js 18+
- npm

### Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/passvault.git
cd passvault

# Instale as dependências
npm install

# Inicie em modo desenvolvimento
npm run dev
```

### Instalador Windows

[PassVaultSetup.exe](https://drive.google.com/file/d/1OQu32SuiHmpbDfqEN94ViblVGY-AtpWr/view?usp=sharing)

---

## 📸 Screenshots

## ![](https://res.cloudinary.com/dk5qtnwmd/image/upload/v1773515609/Captura_de_tela_2026-03-14_161209_dosf9a.png)

## ![](https://res.cloudinary.com/dk5qtnwmd/image/upload/v1773515609/Captura_de_tela_2026-03-14_161243_ouxdib.png)

## ![](https://res.cloudinary.com/dk5qtnwmd/image/upload/v1773515609/Captura_de_tela_2026-03-14_161248_t4moeo.png)

![](https://res.cloudinary.com/dk5qtnwmd/image/upload/v1773515609/Captura_de_tela_2026-03-14_161251_mdlcb3.png)

---

## 🤔 Por que local e não na nuvem?

Gerenciadores de senha baseados em nuvem dependem de você confiar no servidor de terceiros. Com o PassVault:

- ✅ Você tem **controle total** dos seus dados
- ✅ **Zero superfície de ataque** remota — sem servidores para hackear
- ✅ Funciona **sem internet**
- ✅ O código é **aberto e auditável** — você pode verificar cada linha de segurança

---
