# Configuração do Token GitHub

Este documento explica como configurar o token GitHub para usar o servidor MCP.

## Criando um Token GitHub

1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token" > "Generate new token (classic)"
3. Dê um nome descritivo ao token (ex: "MCP Server")
4. Selecione as permissões necessárias:
   - Para operações básicas: `repo`, `workflow`
   - Para criar repositórios: adicione `delete_repo`
   - Para organizações: adicione `admin:org`
5. Clique em "Generate token"
6. **IMPORTANTE**: Copie o token imediatamente (não será mostrado novamente)

## Configurando o Token

### Opção 1: Variável de Ambiente (Recomendado para desenvolvimento)

```bash
export GITHUB_TOKEN="ghp_seuTokenAqui"
```

### Opção 2: No arquivo mcp.json

Edite o arquivo `mcp.json` e adicione seu token:

```json
{
  "name": "puppeteer-github-server",
  "description": "Combined MCP server with Puppeteer and GitHub tools",
  "command": "node",
  "args": ["/Users/phiz/Desktop/mcp/mcp-run-ts/build/index.js"],
  "env": {
    "GITHUB_TOKEN": "ghp_seuTokenAqui"
  }
}
```

### Opção 3: Arquivo .env (Para desenvolvimento local)

1. Crie um arquivo `.env` na raiz do projeto:
```
GITHUB_TOKEN=ghp_seuTokenAqui
```

2. Instale o pacote dotenv:
```bash
npm install dotenv
```

3. Adicione no início do `src/index.ts`:
```typescript
import 'dotenv/config';
```

## Segurança

⚠️ **NUNCA** commite tokens no código ou em arquivos versionados!

- Adicione `.env` ao `.gitignore`
- Use variáveis de ambiente em produção
- Rotacione tokens regularmente
- Use apenas as permissões necessárias

## Testando o Token

Para verificar se o token está funcionando:

```bash
curl -H "Authorization: token SEU_TOKEN" https://api.github.com/user
```

Você deve ver informações da sua conta GitHub.

## Troubleshooting

### "GitHub token not found"
- Verifique se a variável de ambiente está definida
- Confirme que o mcp.json tem o token configurado
- Reinicie o Claude Code após mudanças

### "Bad credentials"
- Token expirado ou inválido
- Gere um novo token no GitHub

### "Resource not accessible by integration"
- Token sem permissões suficientes
- Adicione os escopos necessários ao criar o token