# MCP Puppeteer + GitHub Server - Documentação Técnica

## Visão Geral

Servidor MCP dual-purpose que combina automação web (Puppeteer) com gerenciamento completo de repositórios GitHub (Octokit). Projetado para ambiente de testes seguros com tokens pré-configurados.

## Arquitetura

### Stack Tecnológica
- **TypeScript** 5.3.3 com ES Modules
- **@modelcontextprotocol/sdk** v1.12.1
- **Puppeteer** v24.10.0 (automação headless)
- **Octokit REST** v22.0.0 (GitHub API v3)
- **Node.js** com StdioServerTransport

### Estrutura do Projeto
```
mcp-run-ts/
├── src/
│   └── index.ts          # Servidor MCP com 10 ferramentas
├── build/                # JavaScript compilado
├── mcp.json             # Configuração para Claude Code
├── test-simple.mjs      # Script de teste com SSE
├── GITHUB-TOKEN-SCOPES.md # Documentação de permissões
└── package.json         # Dependências e scripts
```

## Ferramentas Disponíveis (10 total)

### 🌐 Puppeteer (5 ferramentas)
1. **puppeteer_navigate** - Navega para URLs
2. **puppeteer_screenshot** - Captura screenshots (PNG/JPG)
3. **puppeteer_click** - Clica em elementos via seletor CSS
4. **puppeteer_type** - Digita texto em campos
5. **puppeteer_get_content** - Extrai HTML da página

### 🐙 GitHub (5 ferramentas)
1. **github_create_issue** - Cria issues em repositórios
2. **github_list_issues** - Lista issues (open/closed/all)
3. **github_create_pr** - Cria pull requests
4. **github_create_repo** - Cria novos repositórios
5. **github_push_files** - Envia arquivos via Git Tree API

## Características Técnicas

### Gestão de Estado
- **Browser Singleton**: Instância única do Puppeteer para eficiência
- **Lazy Loading**: Browser/Octokit criados sob demanda
- **Headless Mode**: Operação invisível por padrão

### Segurança
- Token GitHub deve ser configurado via variável de ambiente GITHUB_TOKEN
- Suporta tokens com permissões administrativas completas
- URL SSE configurável para ambientes de teste

### API Git Avançada
O `github_push_files` implementa commit direto sem clone:
1. Obtém SHA do branch atual
2. Cria blobs base64 para cada arquivo
3. Constrói árvore Git com os blobs
4. Cria commit apontando para a árvore
5. Atualiza referência do branch

## Casos de Uso

### 1. QA Automatizado
```javascript
// Capturar bug visual e reportar
await puppeteer_navigate({ url: "https://app.com/page" });
await puppeteer_screenshot({ path: "bug.png" });
await github_create_issue({
  owner: "empresa",
  repo: "app",
  title: "Bug visual encontrado",
  body: "Screenshot anexado: bug.png"
});
```

### 2. Deploy de Projeto Completo
```javascript
// Criar repo e enviar código
await github_create_repo({
  name: "novo-projeto",
  private: true,
  gitignore_template: "Node"
});

await github_push_files({
  owner: "usuario",
  repo: "novo-projeto",
  files: [
    { path: "index.js", content: "console.log('Hello');" },
    { path: "package.json", content: "{...}" }
  ],
  message: "Initial commit"
});
```

### 3. Monitoramento com Alertas
```javascript
// Verificar site e criar issue se houver problema
await puppeteer_navigate({ url: "https://site.com" });
const html = await puppeteer_get_content();

if (html.includes("error")) {
  await github_create_issue({
    owner: "team",
    repo: "monitoring",
    title: `Alerta: Site com erro ${new Date().toISOString()}`
  });
}
```

## Instalação e Uso

### Setup Rápido
```bash
npm install
npm run build
claude mcp add /Users/phiz/Desktop/mcp/mcp-run-ts/mcp.json
```

### Scripts Disponíveis
- `npm run build` - Compila TypeScript
- `npm run dev` - Modo watch para desenvolvimento
- `npm start` - Executa servidor compilado
- `node test-simple.mjs` - Testa conexão SSE

## Notas Técnicas

### Puppeteer
- Adiciona `.png` automaticamente se extensão não fornecida
- Suporta screenshots de página inteira com `fullPage: true`
- Browser persiste entre chamadas para performance

### GitHub API
- Usa Octokit REST (não GraphQL)
- Token com escopos administrativos completos
- Suporta templates de gitignore e licença
- Commit direto sem working directory local

### MCP Protocol
- Comunicação via StdioServerTransport
- Schemas de entrada validados por ferramenta
- Respostas em JSON formatado
- Tratamento de erros com mensagens descritivas

## Ambiente de Desenvolvimento

Para usar este servidor, configure:
- Token GitHub via variável de ambiente GITHUB_TOKEN
- URL SSE para testes (test-simple.mjs)
- Permissões adequadas no token GitHub

Para uso em produção, sempre use variáveis de ambiente seguras.