# 🌍 Configuração de Variáveis de Ambiente

Este guia mostra como configurar as variáveis de ambiente para o projeto FitLife Gym Manager.

## 📁 Estrutura de Arquivos

### Frontend (.env na raiz do projeto)
```bash
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Hefel Gym Manager
VITE_APP_VERSION=1.0.0

# Development settings
VITE_DEV_PORT=8080
VITE_ENABLE_DEBUG=false
```

### Backend (backend/.env)
```bash
# Backend Environment Variables
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=fitlife-gym-manager-secret-key-2024
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081,http://localhost:3000,http://localhost:5173

# Security
BCRYPT_ROUNDS=10

# Feature flags
ENABLE_LOGGING=true
ENABLE_CORS=true
```

## 🚀 Como Configurar

### 1. Frontend
```bash
# Na raiz do projeto, crie o arquivo .env
echo "VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Hefel Gym Manager
VITE_APP_VERSION=1.0.0
VITE_DEV_PORT=8080
VITE_ENABLE_DEBUG=false" > .env
```

### 2. Backend
```bash
# Na pasta backend, crie o arquivo .env
cd backend
echo "PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=fitlife-gym-manager-secret-key-2024
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081,http://localhost:3000,http://localhost:5173
BCRYPT_ROUNDS=10
ENABLE_LOGGING=true
ENABLE_CORS=true" > .env
```

## ⚙️ Variáveis Disponíveis

### Frontend
- `VITE_API_URL`: URL da API backend
- `VITE_APP_NAME`: Nome da aplicação
- `VITE_APP_VERSION`: Versão da aplicação
- `VITE_DEV_PORT`: Porta do servidor de desenvolvimento
- `VITE_ENABLE_DEBUG`: Habilita logs de debug

### Backend
- `PORT`: Porta do servidor backend
- `NODE_ENV`: Ambiente (development/production)
- `DATABASE_URL`: String de conexão com a base de dados
- `JWT_SECRET`: Chave secreta para JWT
- `JWT_EXPIRES_IN`: Tempo de expiração do token
- `FRONTEND_URL`: URL do frontend principal
- `ALLOWED_ORIGINS`: URLs permitidas para CORS (separadas por vírgula)
- `BCRYPT_ROUNDS`: Número de rounds para hash de senhas
- `ENABLE_LOGGING`: Habilita logs detalhados
- `ENABLE_CORS`: Habilita CORS

## 🔒 Segurança

**⚠️ IMPORTANTE:**
- Nunca commite arquivos `.env` no Git
- Use senhas fortes para `JWT_SECRET` em produção
- Configure `ALLOWED_ORIGINS` adequadamente em produção
- Use `NODE_ENV=production` em produção

## 🌐 Produção

Para produção, use variáveis de ambiente mais seguras:

```bash
# Exemplo para produção
NODE_ENV=production
PORT=3001
JWT_SECRET=sua-chave-super-secreta-aqui-128-caracteres-minimo
DATABASE_URL=sua-url-de-producao
FRONTEND_URL=https://seu-dominio.com
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
ENABLE_LOGGING=false
```

## 🧪 Desenvolvimento

Para desenvolvimento local rápido:

```bash
# Executar frontend
npm run dev

# Executar backend (em outro terminal)
cd backend && npm run dev
```

Os serviços estarão disponíveis em:
- Frontend: http://localhost:8080
- Backend: http://localhost:3001
- API: http://localhost:3001/api 