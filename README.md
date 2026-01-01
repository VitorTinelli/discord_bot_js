# Discord Bot - TypeScript Version

Bot Discord com funcionalidades de música, chat com IA, sistema de histórias RPG e links sociais.

## 🚀 Funcionalidades

### 🎵 Música
| Comando | Descrição |
|---------|-----------|
| `/play <query>` | Toca uma música (pesquisa ou link YouTube/SoundCloud) |
| `/queue` | Mostra a fila de músicas |
| `/skip` | Pula a música atual |
| `/pause` | Pausa a música |
| `/resume` | Retoma a música |
| `/stop` | Para a música e limpa a fila |
| `/leave` | Desconecta o bot do canal de voz |
| `/clear` | Limpa a fila de músicas |

### 🤖 IA (Bitinto-chan)
| Comando | Descrição |
|---------|-----------|
| `/ask <message>` | Pergunte algo para a Bitinto-chan |

### 📖 RPG (Histórias)
| Comando | Descrição |
|---------|-----------|
| `/criar_historia <titulo> <conteudo>` | Cria sua história de RPG |
| `/ler_historia [usuario]` | Lê uma história (sua ou de outro usuário) |
| `/editar_historia [titulo] [conteudo]` | Edita sua história |
| `/deletar_historia` | Deleta sua história |

### 🔗 Social
| Comando | Descrição |
|---------|-----------|
| `/tinelli` | Links do criador |
| `/devs` | Links dos desenvolvedores |

## 📋 Pré-requisitos

- Node.js 18+ 
- NPM ou Yarn
- Conta na [Discloud](https://discloud.com) (para hospedagem)
- Conta no [Supabase](https://supabase.com) (banco de dados)
- Chave API do [Groq](https://console.groq.com) (IA)

## 🛠️ Configuração do Supabase

1. Crie um projeto no [Supabase Dashboard](https://app.supabase.com)

2. Execute o seguinte SQL no SQL Editor:

```sql
-- Criar tabela de histórias
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Política para acesso do bot (usando service role key)
CREATE POLICY "Service role access" ON stories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Índice para buscas por user_id
CREATE INDEX idx_stories_user_id ON stories(user_id);
```

3. Copie a URL e a Service Role Key do projeto (Settings > API)

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Discord Bot Token
DISCORD_TOKEN=seu_token_do_discord

# Groq API Key (para IA)
GROQ_API_KEY=sua_chave_groq

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key

# Porta do servidor (opcional)
PORT=8080
```

## 🚀 Instalação Local

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Rodar o bot
npm start

# Ou em modo desenvolvimento
npm run dev
```

## ☁️ Deploy na Discloud

### Usando a CLI:

```bash
# Instalar CLI da Discloud
npm install -g discloud-cli

# Login
discloud login

# Deploy
discloud up
```

### Usando o Dashboard:

1. Compile o projeto: `npm run build`
2. Crie um arquivo ZIP contendo:
   - `dist/` (pasta compilada)
   - `package.json`
   - `discloud.config`
3. Faça upload em [discloud.com/panel](https://discloud.com/panel)
4. Configure as variáveis de ambiente no painel

### Variáveis na Discloud:

No painel da Discloud, adicione as variáveis:
- `DISCORD_TOKEN`
- `GROQ_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

## 📁 Estrutura do Projeto

```
discord_bot_js/
├── src/
│   ├── commands/
│   │   ├── aichat.ts    # Comando /ask (IA)
│   │   ├── music.ts     # Comandos de música
│   │   ├── rpg.ts       # Comandos de histórias
│   │   └── social.ts    # Comandos sociais
│   ├── lib/
│   │   └── supabase.ts  # Cliente Supabase
│   ├── types/
│   │   └── index.ts     # Tipos TypeScript
│   └── index.ts         # Entry point
├── dist/                # Código compilado
├── .env.example         # Exemplo de variáveis
├── .gitignore
├── .discloudignore
├── discloud.config      # Config Discloud
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Migração do Python

Este projeto é uma migração do bot original em Python. Principais mudanças:

| Python | TypeScript |
|--------|------------|
| discord.py | discord.js v14 |
| SQLite (rpg.db) | Supabase (PostgreSQL) |
| yt-dlp | DisTube + plugins |
| groq (Python) | groq-sdk (Node.js) |
| aiohttp | Express |

## 👨‍💻 Desenvolvedores

- [Vitor Tinelli](https://github.com/vitortinelli)
- [Lucas Frasson](https://github.com/herudegan)
- [Vinicius D.S.N](https://github.com/ViniciusDSN)

## 📄 Licença

MIT License
