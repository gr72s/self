# Commit Message Convention

This project adheres to the [Conventional Commits](https://www.conventionalcommits.org/) specification. This convention provides a set of rules for creating an explicit commit history, which makes it easier to write automated tools on top of.

## Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

## Types

The following commit types are allowed:

| Type | Description | CI/CD Trigger |
| :--- | :--- | :--- |
| `feat` | A new feature | **Yes** (Deploy) |
| `fix` | A bug fix | **Yes** (Deploy) |
| `docs` | Documentation only changes | No |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, etc) | No |
| `refactor` | A code change that neither fixes a bug nor adds a feature | No |
| `perf` | A code change that improves performance | No |
| `test` | Adding missing tests or correcting existing tests | No |
| `chore` | Changes to the build process or auxiliary tools and libraries | No |
| `ci` | Changes to our CI configuration files and scripts | No |

> [!NOTE]
> The CI/CD pipeline is configured to **only** trigger a full server deployment/restart when the commit message contains `feat`, `fix`, or `feature`. Other types will run lighter checks but skip the heavy deployment steps.

## Examples

**Feature Commit (Triggers Deploy)**
```
feat: add user authentication module
```

**Bug Fix (Triggers Deploy)**
```
fix: resolve null pointer exception in login
```

**Documentation (Skips Deploy)**
```
docs: update readme with setup instructions
```

**Chore (Skips Deploy)**
```
chore: update npm dependencies
```

## Enforcement

We use `husky` and `commitlint` to enforce these rules. If you attempt to make a commit that violates these conventions, the commit will be **blocked** with an error message.
