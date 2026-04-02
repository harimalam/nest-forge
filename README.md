<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <strong>Nest-Forge</strong><br />
  A high-performance, enterprise-ready NestJS starter template.
</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://pnpm.io/" target="_blank"><img src="https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg" alt="pnpm" /></a>
<a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen.svg" alt="Node Version" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## 🚀 Overview

**Nest-Forge** is a progressive [NestJS](https://github.com/nestjs/nest) boilerplate designed for developers who prioritize speed and modern standards. Unlike the default starter, Nest-Forge comes pre-configured with:

* ⚡ **Fastify** as the underlying HTTP engine for maximum throughput.
* 📦 **pnpm 10 Workspaces** for efficient dependency management and monorepo readiness.
* 🟢 **Node 24 (LTS)** compatibility to leverage the latest V8 performance features.
* 🧪 **Strict E2E Testing** pre-configured for the Fastify adapter lifecycle.

## 🤝 Contributing

We love contributions! To keep the project maintainable and synchronized, please follow these steps:

### 1. Find an Issue

Head over to the [Issues](../../issues) tab and look for tasks labeled `help wanted` or `good first issue`. Comment on the issue to let us know you are working on it.

### 2. Setup your Workspace

If you haven't already, **Fork** the repository and clone it locally. Then, add the original repository as an `upstream` remote to stay in sync:

```bash
# Add the original repo as upstream
$ git remote add upstream [https://github.com/harimalam/nest-forge.git](https://github.com/harimalam/nest-forge.git)

# Install dependencies (Node 24+ and pnpm 10 required)
$ pnpm install
```

### 3. Sync your Fork

Before starting any new feature, always ensure your local `main` branch is up to date:

```bash
# Switch to main and pull latest changes
$ git checkout main
$ git fetch upstream
$ git merge upstream/main

# Push the updates to your GitHub fork
$ git push origin main
```

### 4. Create a Feature Branch

```bash
$ git checkout -b feat/your-feature-name
```

### 5. Submit a PR

- Ensure your code follows the linting rules: `pnpm run lint`
- Ensure all tests pass: `pnpm run test:e2e`
- Push your changes to your fork and open a **Pull Request**.
- **Note:** Include `Closes #issue-number` in your PR description so the issue is automatically linked.
