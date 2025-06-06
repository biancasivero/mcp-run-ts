# Formas de Instalação do MCP Server

Este documento explica as diferentes formas de adicionar um servidor MCP ao Claude Code.

## Métodos de Instalação

### 1. Usando arquivo mcp.json (RECOMENDADO)
```bash
claude mcp add /Users/phiz/Desktop/mcp/mcp-run-ts/mcp.json
```

**Vantagens:**
- ✅ Mais simples e direto
- ✅ Configuração centralizada em um arquivo
- ✅ Fácil de compartilhar e versionar
- ✅ Permite definir variáveis de ambiente

**Quando usar:**
- Para projetos locais
- Quando você tem controle sobre o arquivo mcp.json
- Para configurações que precisam de variáveis de ambiente

### 2. Comando direto com nome customizado
```bash
claude mcp add Bianca -- node /Users/phiz/Desktop/mcp/mcp-run-ts/build/index.js
```
**Vantagens:**
- ✅ Permite dar um nome customizado ao servidor ("Bianca")
- ✅ Útil quando você tem múltiplas instâncias do mesmo servidor
- ✅ Não precisa do arquivo mcp.json

**Desvantagens:**
- ❌ Mais verboso
- ❌ Não permite configurar variáveis de ambiente facilmente
- ❌ Precisa especificar o caminho completo do executável

**Quando usar:**
- Quando você quer múltiplas instâncias com nomes diferentes
- Para testes rápidos sem criar mcp.json
- Quando o nome padrão conflita com outro servidor

## Comparação

| Aspecto                 | mcp.json | Comando direto |
|-------------------------|----------|----------------|
| Simplicidade            | ⭐⭐⭐⭐⭐ | ⭐⭐⭐         |
| Customização do nome      | ❌ | ✅ |
| Variáveis de ambiente     | ✅ | ❌ |
| Compartilhamento          | ✅ | ❌ |
| Manutenção                | ✅ | ❌ |

## Recomendação

**Use o método mcp.json** na maioria dos casos:
- É mais simples
- Permite configuração completa
- Facilita o compartilhamento do projeto

**Use o comando direto apenas quando:**
- Precisar de um nome customizado
- Estiver fazendo testes rápidos
- Tiver conflitos de nomes

## Estrutura do mcp.json

```json
{
  "name": "puppeteer-github-server",
  "description": "Combined MCP server with Puppeteer and GitHub tools",
  "command": "node",
  "args": ["/Users/phiz/Desktop/mcp/mcp-run-ts/build/index.js"],
  "env": {}
}
```

## Verificando a Instalação

Após adicionar por qualquer método:

1. Reinicie o Claude Code
2. Verifique com:
```bash
claude mcp list
```

Você deve ver o servidor listado (como "puppeteer-github-server" ou "Bianca", dependendo do método usado).