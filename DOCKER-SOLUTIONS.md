# 🐳 Docker Solutions Guide

Este guia fornece soluções para os problemas comuns do Docker encontrados no projeto.

## ✅ **Problemas Corrigidos:**

### 1. **Warning: version obsoleta**
- **Problema:** `version: '3.8'` é obsoleto no Docker Compose
- **Solução:** Removido a linha `version` do docker-compose.yml

### 2. **Warnings de casing em Dockerfiles**
- **Problema:** `FROM node:20-alpine as builder` (minúsculo)
- **Solução:** Mudado para `FROM node:20-alpine AS builder` (maiúsculo)

### 3. **Timeout de rede**
- **Problema:** Não consegue baixar imagens do Docker Hub
- **Soluções:** Múltiplas abordagens disponíveis

## 🚀 **Soluções Disponíveis:**

### **Solução 1: Script de Troubleshooting**
```bash
# Execute o script de diagnóstico
./docker-troubleshoot.sh
```

O script irá:
- ✅ Verificar se Docker está rodando
- ✅ Testar conectividade com Docker Hub
- ✅ Limpar cache do Docker
- ✅ Baixar imagens individualmente
- ✅ Construir com timeout aumentado

### **Solução 2: Usar Imagens Mais Estáveis**
```bash
# Use o docker-compose alternativo
docker-compose -f docker-compose.fallback.yml up -d
```

**Diferenças das imagens fallback:**
- `node:20-alpine` → `node:18-alpine`
- `postgres:15-alpine` → `postgres:14-alpine`
- `nginx:alpine` → `nginx:1.24-alpine`

### **Solução 3: Desenvolvimento Local (Recomendado)**
```bash
# Frontend (Terminal 1)
npm run dev

# Backend (Terminal 2)
cd backend && npm run dev

# Banco de dados local (Terminal 3)
docker run -d \
  --name fitlife-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fitlife \
  -p 5432:5432 \
  postgres:14-alpine
```

### **Solução 4: Configuração Manual do Docker**

#### **Para Proxy Corporativo:**
```bash
# Criar ~/.docker/config.json
{
  "proxies": {
    "default": {
      "httpProxy": "http://proxy.empresa.com:8080",
      "httpsProxy": "http://proxy.empresa.com:8080",
      "noProxy": "localhost,127.0.0.1"
    }
  }
}
```

#### **Para Aumentar Timeouts:**
```bash
# Variáveis de ambiente
export DOCKER_BUILDKIT=1
export COMPOSE_HTTP_TIMEOUT=300
export DOCKER_CLIENT_TIMEOUT=300

# Depois executar
docker-compose build --no-cache
```

## 📊 **Comandos Úteis:**

### **Diagnóstico:**
```bash
# Verificar status do Docker
docker info

# Verificar imagens disponíveis
docker images

# Verificar containers rodando
docker ps

# Verificar uso de recursos
docker system df
```

### **Limpeza:**
```bash
# Limpar cache
docker system prune -f

# Limpar tudo (cuidado!)
docker system prune -a -f

# Limpar volumes
docker volume prune -f
```

### **Build Manual:**
```bash
# Construir apenas uma imagem
docker build -t fitlife-backend ./backend

# Construir sem cache
docker build --no-cache -t fitlife-backend ./backend

# Construir com output detalhado
docker build --progress=plain -t fitlife-backend ./backend
```

## 🎯 **Recomendações:**

### **Para Desenvolvimento:**
1. **Use ambiente local** (npm run dev)
2. **Docker apenas para produção**
3. **PostgreSQL via Docker é ok**

### **Para Produção:**
1. **Use docker-compose.yml principal**
2. **Configure proxy se necessário**
3. **Use imagens específicas (não :latest)**

### **Para Troubleshooting:**
1. **Execute ./docker-troubleshoot.sh primeiro**
2. **Verifique logs: docker-compose logs**
3. **Use fallback se necessário**

## 🔧 **Configuração de Ambiente:**

### **Desenvolvimento:**
```bash
# .env (raiz do projeto)
VITE_API_URL=http://localhost:3001/api

# backend/.env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitlife
```

### **Docker:**
```bash
# As variáveis estão no docker-compose.yml
# Você pode sobrescrevê-las criando .env.docker
```

### **Produção:**
```bash
# Use variáveis de ambiente do sistema
# Ou configure via Docker secrets
```

## 🆘 **Se Ainda Tiver Problemas:**

1. **Verifique sua conexão de internet**
2. **Tente usar um VPN**
3. **Use imagens locais/alternativas**
4. **Execute em modo desenvolvimento**
5. **Consulte logs detalhados**

## 📞 **Comandos de Emergência:**

```bash
# Parar tudo
docker-compose down

# Remover tudo
docker-compose down -v --rmi all

# Recomeçar do zero
docker system prune -a -f
docker-compose up -d --build
```

---

💡 **Dica:** Se você está apenas desenvolvendo, **use npm run dev** para frontend e backend. Docker é principalmente para produção e testes de integração. 