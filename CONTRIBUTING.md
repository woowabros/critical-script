# Contributing to critical-script

English | [한국어](./CONTRIBUTING-ko_kr.md)

Thank you for your interest in critical-script. This guide explains how to prepare the development environment and submit changes.

## Prepare the development environment

### Requirements

This repository uses:

- Node.js **24.15.0**
- pnpm **11.1.2**

Install pnpm by following the [pnpm installation guide](https://pnpm.io/installation).

### Set up the repository

1. Fork the repository and clone your fork.

```bash
git clone https://github.com/your-username/critical-script.git
cd critical-script
```

2. Install the root workspace dependencies.

```bash
pnpm install
```

The documentation site and example app are separate pnpm projects outside the root workspace. Install their dependencies when working in those areas.

```bash
pnpm --dir docs install
pnpm --dir examples/vite-react-ssg install
```

## Project structure

```text
critical-script/
├── packages/
│   └── vite-plugin-critical-script/  # Plugin source, tests, and build configuration
├── examples/
│   └── vite-react-ssg/               # Vite-based React SSG example
├── docs/                              # Astro and Starlight documentation site
└── .github/workflows/                 # CI, deployment, and release workflows
```

- `packages/vite-plugin-critical-script/` contains the plugin package published to npm.
- `examples/vite-react-ssg/` is a standalone example that uses the published plugin.
- `docs/` is a separate project with its own lockfile. `docs/en/` and `docs/ko/` are the documentation sources.

## Develop and validate

When changing the plugin, run these checks from the repository root:

```bash
pnpm -r lint
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

When changing the documentation site, run:

```bash
pnpm --dir docs typecheck
pnpm --dir docs build
```

When changing the example app, run:

```bash
pnpm --dir examples/vite-react-ssg typecheck
pnpm --dir examples/vite-react-ssg build
```

Update tests and documentation when they are relevant to your change.

### Code style

This project uses ESLint and Prettier. The Husky pre-commit hook runs the required checks on staged files. To run the same checks manually:

```bash
pnpm lint-staged
```

## Submit changes

### Pull request process

1. Update the `main` branch in your fork.
2. Create a branch that describes the work.

```bash
git switch -c feature/your-feature-name
```

3. Implement the change and run the relevant checks.
4. Add a DCO sign-off to every commit.

```bash
git commit -s -m "feat: add new feature"
```

5. Push the branch to your fork and open a pull request against the upstream repository.

In the pull request, explain the purpose and main changes, and list how you verified the work. Include related tests and documentation when behavior changes.

### Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format.

- `feat:` new functionality
- `fix:` bug fix
- `docs:` documentation change
- `refactor:` code restructuring without a behavior change
- `test:` test addition or update
- `chore:` other maintenance work

### Developer Certificate of Origin

This project follows the [Developer Certificate of Origin (DCO) 1.1](./DCO). Every commit must include a sign-off confirming that you have the right to submit the contribution.

Add `-s` or `--signoff` to `git commit` to append the sign-off line:

```text
Signed-off-by: Your Name <your.email@example.com>
```

The name and email in `Signed-off-by` come from your Git `user.name` and `user.email` settings. If a sign-off is missing, use `git commit --amend -s` for the latest commit or `git rebase --signoff <base>` for multiple commits.

## Report an issue

Include the following information when reporting an issue:

- A clear description of the problem
- Steps or a minimal example that reproduces it
- The difference between expected and actual behavior
- Relevant environment information, such as Node.js, Vite, and framework versions

## Code of Conduct

All contributors must follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Contributions are licensed under this repository's [MIT License](./LICENSE).
