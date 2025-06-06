# GitHub Token Scopes - Documentação

Este documento lista todos os escopos (permissões) configurados no token GitHub usado pelo servidor MCP.

## Token Configurado

O token possui controle total sobre repositórios, organizações, usuários e recursos do GitHub.

## Escopos Habilitados

### Repositórios
- **repo** - Controle total de repositórios privados
- **repo:status** - Acesso ao status de commits
- **repo_deployment** - Acesso ao status de deployments
- **public_repo** - Acesso a repositórios públicos
- **repo:invite** - Acesso a convites de repositório
- **security_events** - Leitura e escrita de eventos de segurança
- **workflow** - Atualização de workflows do GitHub Actions
- **delete_repo** - Deletar repositórios

### Packages
- **write:packages** - Upload de pacotes para GitHub Package Registry
- **read:packages** - Download de pacotes do GitHub Package Registry
- **delete:packages** - Deletar pacotes do GitHub Package Registry

### Organizações
- **admin:org** - Controle total de organizações e times
- **write:org** - Leitura e escrita de membros de org e times
- **read:org** - Leitura de membros de org e times
- **manage_runners:org** - Gerenciar runners da organização

### Chaves e Hooks
- **admin:public_key** - Controle total de chaves públicas do usuário
- **write:public_key** - Escrita de chaves públicas do usuário
- **read:public_key** - Leitura de chaves públicas do usuário
- **admin:repo_hook** - Controle total de hooks de repositório
- **write:repo_hook** - Escrita de hooks de repositório
- **read:repo_hook** - Leitura de hooks de repositório
- **admin:org_hook** - Controle total de hooks de organização

### Usuário
- **user** - Atualizar TODOS os dados do usuário
- **read:user** - Ler TODO o perfil do usuário
- **user:email** - Acesso aos emails do usuário (somente leitura)
- **user:follow** - Seguir e deixar de seguir usuários

### Gists e Notificações
- **gist** - Criar gists
- **notifications** - Acesso a notificações

### Discussões
- **write:discussion** - Ler e escrever discussões de time
- **read:discussion** - Ler discussões de time

### Enterprise
- **admin:enterprise** - Controle total de enterprises
- **manage_runners:enterprise** - Gerenciar runners enterprise
- **manage_billing:enterprise** - Ler e escrever dados de cobrança enterprise
- **read:enterprise** - Ler dados do perfil enterprise
- **scim:enterprise** - Provisionamento de usuários via SCIM

### Audit Log
- **audit_log** - Controle total do log de auditoria
- **read:audit_log** - Acesso de leitura ao log de auditoria

### Codespaces
- **codespace** - Controle total de codespaces
- **codespace:secrets** - Criar, ler, atualizar e deletar secrets de codespace

### Copilot
- **copilot** - Controle total das configurações do GitHub Copilot
- **manage_billing:copilot** - Ver e editar assentos do Copilot Business

### Network
- **write:network_configurations** - Escrever configurações de rede
- **read:network_configurations** - Ler configurações de rede

### Projects
- **project** - Controle total de projetos
- **read:project** - Acesso de leitura a projetos

### Chaves GPG e SSH
- **admin:gpg_key** - Controle total de chaves GPG públicas
- **write:gpg_key** - Escrever chaves GPG públicas
- **read:gpg_key** - Ler chaves GPG públicas
- **admin:ssh_signing_key** - Controle total de chaves SSH de assinatura
- **write:ssh_signing_key** - Escrever chaves SSH de assinatura
- **read:ssh_signing_key** - Ler chaves SSH de assinatura

## Uso no Servidor MCP

Com esses escopos, o servidor MCP pode:

1. **Gerenciar Repositórios Completamente**
   - Criar, atualizar, deletar repositórios
   - Gerenciar issues, PRs, releases
   - Configurar webhooks e deployments

2. **Automação Avançada**
   - Atualizar workflows do GitHub Actions
   - Gerenciar runners e ambientes
   - Configurar segurança e auditorias

3. **Gestão de Organização**
   - Gerenciar times e membros
   - Configurar permissões
   - Administrar projetos organizacionais

4. **Integração Completa**
   - Acessar e gerenciar packages
   - Trabalhar com codespaces
   - Integrar com GitHub Copilot

## Segurança

⚠️ **ATENÇÃO**: Este token possui permissões administrativas completas. Em produção:
- Use apenas os escopos necessários
- Armazene o token em variáveis de ambiente seguras
- Nunca commite tokens no código
- Rotacione tokens regularmente

## Configuração

Configure o token via variável de ambiente:

```bash
export GITHUB_TOKEN="seu_token_aqui"
```

O código irá buscar o token automaticamente:

```typescript
// src/index.ts
function ensureGitHub() {
  if (!octokit) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GitHub token not found. Please set GITHUB_TOKEN environment variable.');
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}
```