# Module 5: Version Control and Git

Git is the standard version control system for software development. This module covers essential Git operations, workflows, and best practices for JavaScript projects.

---

## 5.1 Git Fundamentals

### What It Is

Git is a distributed version control system that tracks changes in source code. Every developer has a complete copy of the repository history, enabling offline work and fast operations.

### Basic Configuration

```bash
# Set identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Set default editor
git config --global core.editor "code --wait"  # VS Code

# Enable helpful colors
git config --global color.ui auto

# Set pull behavior
git config --global pull.rebase true  # Rebase instead of merge on pull

# View configuration
git config --list
```

### Repository Operations

```bash
# Initialize new repository
git init

# Clone existing repository
git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git  # SSH

# Clone specific branch
git clone -b develop https://github.com/user/repo.git

# Shallow clone (faster, less history)
git clone --depth 1 https://github.com/user/repo.git
```

### Staging and Committing

```bash
# Check status
git status
git status -s  # Short format

# Stage files
git add file.js           # Single file
git add src/              # Directory
git add .                 # All changes
git add -p                # Interactive staging (patch mode)

# Unstage files
git restore --staged file.js
git reset HEAD file.js    # Older syntax

# Commit
git commit -m "Add feature"
git commit                # Opens editor for message
git commit -am "Message"  # Stage tracked files and commit

# Amend last commit
git commit --amend -m "New message"
git commit --amend --no-edit  # Keep message, add staged changes

# View commit history
git log
git log --oneline
git log --oneline --graph --all
git log -n 5              # Last 5 commits
git log --author="Name"
git log --since="2024-01-01"
git log -- file.js        # History of specific file
```

### Branching

```bash
# List branches
git branch                # Local branches
git branch -r             # Remote branches
git branch -a             # All branches

# Create branch
git branch feature/login
git checkout -b feature/login  # Create and switch
git switch -c feature/login    # Modern syntax

# Switch branches
git checkout main
git switch main           # Modern syntax

# Rename branch
git branch -m old-name new-name
git branch -m new-name    # Rename current branch

# Delete branch
git branch -d feature/login     # Safe delete (merged only)
git branch -D feature/login     # Force delete

# Delete remote branch
git push origin --delete feature/login
```

### Merging and Rebasing

```bash
# Merge branch into current
git merge feature/login

# Merge with no fast-forward (always create merge commit)
git merge --no-ff feature/login

# Abort merge conflict
git merge --abort

# Rebase current branch onto main
git rebase main

# Interactive rebase (edit, squash, reorder commits)
git rebase -i HEAD~3      # Last 3 commits
git rebase -i main        # All commits since main

# Continue rebase after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

### Remote Operations

```bash
# List remotes
git remote -v

# Add remote
git remote add origin https://github.com/user/repo.git

# Fetch updates (without merging)
git fetch origin
git fetch --all           # All remotes

# Pull (fetch + merge/rebase)
git pull origin main
git pull --rebase origin main

# Push
git push origin main
git push -u origin main   # Set upstream
git push --force-with-lease  # Safe force push
git push --tags           # Push tags

# Track remote branch
git branch --set-upstream-to=origin/main main
```

### Undoing Changes

```bash
# Discard working directory changes
git restore file.js
git checkout -- file.js   # Older syntax

# Unstage file
git restore --staged file.js

# Reset to previous commit
git reset --soft HEAD~1   # Keep changes staged
git reset --mixed HEAD~1  # Keep changes unstaged (default)
git reset --hard HEAD~1   # Discard changes (DANGEROUS)

# Revert commit (creates new commit)
git revert abc123
git revert HEAD           # Revert last commit

# Recover deleted commits
git reflog
git reset --hard abc123   # Go back to specific state
```

### Stashing

```bash
# Stash changes
git stash
git stash push -m "Work in progress"

# Include untracked files
git stash -u

# List stashes
git stash list

# Apply stash
git stash apply           # Keep stash
git stash pop             # Apply and remove stash

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
git stash clear           # Remove all stashes
```

---

## 5.2 Git Workflows

### Feature Branch Workflow

The most common workflow for teams. Each feature gets its own branch.

```bash
# 1. Start from updated main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/user-auth

# 3. Work on feature (multiple commits)
git add .
git commit -m "Add login form"
git commit -m "Add form validation"
git commit -m "Connect to auth API"

# 4. Push branch and create PR
git push -u origin feature/user-auth

# 5. After PR review and merge, clean up
git checkout main
git pull origin main
git branch -d feature/user-auth
```

### Gitflow Workflow

Structured workflow with specific branch types for larger projects.

```
main          ─────●─────────────────────●─────────────
                   │                     │
release       ─────│───────●─────●───────│─────────────
                   │       │     │       │
develop       ─────●───●───●─────●───●───●─────────────
                       │             │
feature       ─────────●─────────────●─────────────────
```

```bash
# Branch types:
# - main: Production-ready code
# - develop: Integration branch
# - feature/*: New features
# - release/*: Release preparation
# - hotfix/*: Production fixes

# Start feature
git checkout develop
git checkout -b feature/new-feature

# Finish feature
git checkout develop
git merge --no-ff feature/new-feature
git branch -d feature/new-feature

# Start release
git checkout develop
git checkout -b release/1.0.0

# Finish release
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
```

### Trunk-Based Development

Fast-moving workflow where developers commit directly to main (or short-lived branches).

```bash
# Work directly on main with small, frequent commits
git checkout main
git pull origin main

# Make small change
git add .
git commit -m "Add input validation"
git push origin main

# Or use very short-lived branches (< 1 day)
git checkout -b fix/typo
# Fix the issue
git checkout main
git merge fix/typo
git push origin main
git branch -d fix/typo
```

### Workflow Comparison

| Aspect | Feature Branch | Gitflow | Trunk-Based |
|--------|---------------|---------|-------------|
| Complexity | Medium | High | Low |
| Release Cadence | Any | Scheduled | Continuous |
| Branch Lifetime | Days-weeks | Varies | Hours-1 day |
| Best For | Most teams | Enterprise | CI/CD heavy |

---

## 5.3 Git Best Practices

### Commit Messages

```bash
# Good commit message format
<type>(<scope>): <subject>

<body>

<footer>
```

```bash
# Examples
feat(auth): add OAuth2 login support

Implement Google and GitHub OAuth providers.
Add token refresh logic and secure storage.

Closes #123

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting (no code change)
refactor: Code change (no feature/fix)
perf:     Performance improvement
test:     Adding tests
chore:    Build process, dependencies
ci:       CI configuration
```

```bash
# ❌ Bad commit messages
"fix"
"WIP"
"asdf"
"changes"

# ✅ Good commit messages
"fix(cart): prevent negative quantities"
"feat(api): add pagination to /users endpoint"
"docs: update README installation steps"
```

### Branch Naming

```bash
# Format: type/description
feature/user-authentication
feature/shopping-cart
fix/login-redirect-loop
hotfix/security-patch
refactor/api-client
docs/contributing-guide

# Include ticket number when applicable
feature/PROJ-123-user-authentication
fix/PROJ-456-cart-total
```

### .gitignore

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
.next/
.nuxt/

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Cache
.cache/
.eslintcache
.parcel-cache/

# TypeScript
*.tsbuildinfo
```

### Git Hooks with Husky

```bash
# Install Husky
npm install -D husky
npx husky init
```

```bash
# .husky/pre-commit
npm run lint-staged
```

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci', 'revert'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72]
  }
};
```

### Keeping History Clean

```bash
# Squash commits before merging
git rebase -i main

# In interactive rebase editor:
pick abc123 Add feature base
squash def456 Fix typo
squash ghi789 Address review feedback

# Result: Single clean commit

# Pull with rebase to avoid merge commits
git pull --rebase origin main

# Set as default
git config --global pull.rebase true
```

---

## 5.4 Advanced Git

### Cherry-Pick

```bash
# Apply specific commit to current branch
git cherry-pick abc123

# Cherry-pick without committing
git cherry-pick -n abc123

# Cherry-pick range
git cherry-pick abc123..def456
```

### Bisect

```bash
# Find commit that introduced a bug
git bisect start
git bisect bad                # Current version is bad
git bisect good v1.0.0        # This version was good

# Git checks out middle commit
# Test it, then:
git bisect good  # or
git bisect bad

# Repeat until Git finds the culprit
# When done:
git bisect reset
```

### Submodules

```bash
# Add submodule
git submodule add https://github.com/user/lib.git libs/lib

# Clone repo with submodules
git clone --recurse-submodules https://github.com/user/repo.git

# Initialize submodules after clone
git submodule update --init --recursive

# Update submodules
git submodule update --remote
```

### Worktrees

```bash
# Work on multiple branches simultaneously
git worktree add ../project-hotfix hotfix/urgent-fix

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../project-hotfix
```

---

## 5.5 Summary

| Command | Purpose |
|---------|---------|
| `git init` | Initialize repository |
| `git clone` | Copy repository |
| `git add` | Stage changes |
| `git commit` | Save changes |
| `git push` | Upload to remote |
| `git pull` | Download from remote |
| `git branch` | Manage branches |
| `git merge` | Combine branches |
| `git rebase` | Reapply commits |
| `git stash` | Temporarily store changes |

### Best Practices

1. **Commit often** — Small, focused commits are easier to review and revert
2. **Write good commit messages** — Future you will thank present you
3. **Use branches** — Never commit directly to main
4. **Pull before push** — Avoid merge conflicts
5. **Review before committing** — Use `git diff --staged`
6. **Use .gitignore** — Don't commit generated files
7. **Set up hooks** — Automate linting and testing

---

**End of Module 5: Version Control and Git**

Next: Module 6 — Task Runners
