#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Octokit } from '@octokit/rest';

const server = new Server(
  {
    name: 'puppeteer-github-server',
    version: '1.0.0',
    description: 'Combined MCP server with Puppeteer and GitHub tools',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let browser: Browser | undefined;
let page: Page | undefined;
let octokit: Octokit | undefined;

// Helper functions
async function ensureBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  }
  return { browser, page: page! };
}

function ensureGitHub() {
  if (!octokit) {
    // Token deve ser configurado via variável de ambiente
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GitHub token not found. Please set GITHUB_TOKEN environment variable.');
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Puppeteer tools
      {
        name: 'puppeteer_navigate',
        description: 'Navigate to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to navigate to' },
          },
          required: ['url'],
        },
      },
      {
        name: 'puppeteer_screenshot',
        description: 'Take a screenshot of the current page',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to save the screenshot' },
            fullPage: { type: 'boolean', description: 'Capture full page', default: false },
          },
          required: ['path'],
        },
      },
      {
        name: 'puppeteer_click',
        description: 'Click on an element',
        inputSchema: {
          type: 'object',
          properties: {
            selector: { type: 'string', description: 'CSS selector of element to click' },
          },
          required: ['selector'],
        },
      },
      {
        name: 'puppeteer_type',
        description: 'Type text into an element',
        inputSchema: {
          type: 'object',
          properties: {
            selector: { type: 'string', description: 'CSS selector of element' },
            text: { type: 'string', description: 'Text to type' },
          },
          required: ['selector', 'text'],
        },
      },
      {
        name: 'puppeteer_get_content',
        description: 'Get the HTML content of the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // GitHub tools
      {
        name: 'github_create_issue',
        description: 'Create a new issue in a GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            title: { type: 'string', description: 'Issue title' },
            body: { type: 'string', description: 'Issue body' },
          },
          required: ['owner', 'repo', 'title'],
        },
      },
      {
        name: 'github_list_issues',
        description: 'List issues in a GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            state: { type: 'string', enum: ['open', 'closed', 'all'], default: 'open' },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'github_create_pr',
        description: 'Create a pull request',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            title: { type: 'string', description: 'PR title' },
            body: { type: 'string', description: 'PR body' },
            head: { type: 'string', description: 'Head branch' },
            base: { type: 'string', description: 'Base branch', default: 'main' },
          },
          required: ['owner', 'repo', 'title', 'head'],
        },
      },
      {
        name: 'github_create_repo',
        description: 'Create a new GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Repository name' },
            description: { type: 'string', description: 'Repository description' },
            private: { type: 'boolean', description: 'Make repository private', default: false },
            auto_init: { type: 'boolean', description: 'Initialize with README', default: true },
            gitignore_template: { type: 'string', description: 'Gitignore template (e.g., Node, Python)' },
            license_template: { type: 'string', description: 'License template (e.g., mit, apache-2.0)' },
          },
          required: ['name'],
        },
      },
      {
        name: 'github_push_files',
        description: 'Push files to a GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            branch: { type: 'string', description: 'Branch name', default: 'main' },
            files: { 
              type: 'array', 
              description: 'Array of files to push',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'File path in repo' },
                  content: { type: 'string', description: 'File content' },
                },
                required: ['path', 'content'],
              }
            },
            message: { type: 'string', description: 'Commit message' },
          },
          required: ['owner', 'repo', 'files', 'message'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('No arguments provided');
  }

  switch (name) {
    // Puppeteer handlers
    case 'puppeteer_navigate': {
      const { page } = await ensureBrowser();
      await page.goto(args.url as string);
      return { content: [{ type: 'text', text: `Navigated to ${args.url}` }] };
    }

    case 'puppeteer_screenshot': {
      const { page } = await ensureBrowser();
      const path = args.path as string;
      const fullPage = args.fullPage as boolean || false;
      
      // Ensure path has proper extension
      const validPath = path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.webp') 
        ? path 
        : `${path}.png`;
      
      await page.screenshot({ path: validPath as any, fullPage });
      return { content: [{ type: 'text', text: `Screenshot saved to ${validPath}` }] };
    }

    case 'puppeteer_click': {
      const { page } = await ensureBrowser();
      await page.click(args.selector as string);
      return { content: [{ type: 'text', text: `Clicked on element: ${args.selector}` }] };
    }

    case 'puppeteer_type': {
      const { page } = await ensureBrowser();
      await page.type(args.selector as string, args.text as string);
      return { content: [{ type: 'text', text: `Typed text into element: ${args.selector}` }] };
    }

    case 'puppeteer_get_content': {
      const { page } = await ensureBrowser();
      const content = await page.content();
      return { content: [{ type: 'text', text: content }] };
    }

    // GitHub handlers
    case 'github_create_issue': {
      const github = ensureGitHub();
      const response = await github.issues.create({
        owner: args.owner as string,
        repo: args.repo as string,
        title: args.title as string,
        body: args.body as string,
      });
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    }

    case 'github_list_issues': {
      const github = ensureGitHub();
      const response = await github.issues.listForRepo({
        owner: args.owner as string,
        repo: args.repo as string,
        state: (args.state as 'open' | 'closed' | 'all') || 'open',
      });
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    }

    case 'github_create_pr': {
      const github = ensureGitHub();
      const response = await github.pulls.create({
        owner: args.owner as string,
        repo: args.repo as string,
        title: args.title as string,
        body: args.body as string,
        head: args.head as string,
        base: (args.base as string) || 'main',
      });
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    }

    case 'github_create_repo': {
      const github = ensureGitHub();
      try {
        const response = await github.repos.createForAuthenticatedUser({
          name: args.name as string,
          description: args.description as string,
          private: args.private as boolean || false,
          auto_init: args.auto_init as boolean || true,
          gitignore_template: args.gitignore_template as string,
          license_template: args.license_template as string,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error creating repository: ${error.message}` }] };
      }
    }

    case 'github_push_files': {
      const github = ensureGitHub();
      const owner = args.owner as string;
      const repo = args.repo as string;
      const branch = args.branch as string || 'main';
      const files = args.files as Array<{path: string, content: string}>;
      const message = args.message as string;

      try {
        // Get the latest commit SHA for the branch
        const { data: ref } = await github.git.getRef({
          owner,
          repo,
          ref: `heads/${branch}`,
        });
        const latestCommitSha = ref.object.sha;

        // Get the tree SHA of the latest commit
        const { data: commit } = await github.git.getCommit({
          owner,
          repo,
          commit_sha: latestCommitSha,
        });
        const treeSha = commit.tree.sha;

        // Create blobs for each file
        const blobs = await Promise.all(
          files.map(async (file) => {
            const { data: blob } = await github.git.createBlob({
              owner,
              repo,
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64',
            });
            return {
              path: file.path,
              mode: '100644' as const,
              type: 'blob' as const,
              sha: blob.sha,
            };
          })
        );

        // Create a new tree
        const { data: newTree } = await github.git.createTree({
          owner,
          repo,
          tree: blobs,
          base_tree: treeSha,
        });

        // Create a new commit
        const { data: newCommit } = await github.git.createCommit({
          owner,
          repo,
          message,
          tree: newTree.sha,
          parents: [latestCommitSha],
        });

        // Update the reference
        await github.git.updateRef({
          owner,
          repo,
          ref: `heads/${branch}`,
          sha: newCommit.sha,
        });

        return { content: [{ type: 'text', text: `Successfully pushed ${files.length} files to ${owner}/${repo}` }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error pushing files: ${error.message}` }] };
      }
    }

    default:
      throw new Error(`Tool not found: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Combined Puppeteer + GitHub MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});