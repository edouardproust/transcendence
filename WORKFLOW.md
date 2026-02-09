# Git & GitHub Workflow 

## Table of Contents
- [Git Conventions](#git-conventions)
- [Branch Management](#branch-management)
- [Code Review Guidelines](#code-review-guidelines)

---

## Git Conventions

### Commit Message Format

All commit messages should follow this structure:

```
type(scope): subject

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring (no feature/fix)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)

**Examples:**
```
feat(auth): add JWT token validation
fix(game): resolve paddle collision detection
docs(readme): update installation instructions
refactor(api): simplify user controller logic
```

**Rules:**
- Write in English
- Use imperative mood ("add" not "added" or "adds")
- Keep subject line under 50-72 characters
- Don't end subject with a period
- Separate subject from body with blank line
- Use body to explain *what* and *why*, not *how*

---

## Branch Management

### Branch Structure

```
main
  └── develop
       ├── feature/user-authentication
       ├── feature/game-logic
       ├── feature/chat-system
```

**Branch Types:**

- **`main`**: Production-ready code only
  - Protected branch
  - Always deployable

- **`develop`**: Integration branch
  - Base for all feature branches
  - Contains latest development changes
  - Protected branch

- **`feature/*`**: New features or enhancements
  - Format: `feature/descriptive-name`
  - Branch from `develop`
  - Merge back to `develop` via PR
  - Examples: `feature/user-profile`, `feature/matchmaking`

### Branch Naming Convention

- Use lowercase
- Use hyphens to separate words
- Be descriptive but concise
- Examples:
  - ✅ `feature/real-time-chat`
  - ✅ `fix/login-validation`
  - ❌ `feature/stuff`
  - ❌ `MyNewFeature`

### Workflow

1. **Create feature branch from `develop`:**
```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
```

2. **Work on your feature with regular commits**
   - Commit often, don't worry about "perfect" commits
   - Your work-in-progress commits will be squashed later

3. **Keep your branch updated with `develop`:**
```bash
   git checkout develop
   git pull origin develop
   git checkout feature/my-feature
   git rebase develop
```
   - Use **rebase** (not merge) to keep history linear
   - After rebase, force push: `git push --force-with-lease origin feature/my-feature`
   - ⚠️ Never rebase if others are working on your branch

4. **Push and create Pull Request**
   - Link related issue(s)
   - Request reviewers

5. **Merge using "Squash and merge" on GitHub**
   - All your commits → 1 clean commit in `develop`
   - Edit the squash message to be descriptive

6. **Delete feature branch after merge**
```bash
   git branch -d feature/my-feature
   git push origin --delete feature/my-feature
```

**Note:** For `develop` → `main` merges, use regular "Merge commit" (not squash) to preserve feature history.
---

## Code Review Guidelines

### For Authors
- Keep PRs small and focused (easier to review)
- Provide context in PR description
- Update PR based on comments

### For Reviewers
- Explain *why* when requesting changes
- Approve when satisfied or request changes clearly
- Test the code locally if needed

### Review Checklist
- [ ] Code works as intended
- [ ] No obvious bugs or issues
- [ ] Follows project conventions
- [ ] Properly tested
- [ ] Documentation updated
- [ ] No unnecessary code/comments
- [ ] Readable and maintainable

---

## Best Practices

### General
- **Commit often**: Small, logical commits are better than large ones
- **Pull regularly**: Stay updated with `develop` to avoid conflicts
- **Never commit directly to `main` or `develop`**
- **Write meaningful commit messages**: Help your future self and teammates
- **Test before pushing**: Don't break the build

### Branch Protection
We will enable the following protections:


- Require PR reviews (minimum 2)
- Require status checks to pass
- No direct pushes
- No force pushes

**`develop` branch:**
- Require PR reviews (minimum 1)
- Require status checks to pass
- No direct pushes

---
## Quick Reference

### Common Git Commands
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Regular workflow
git add .
git commit -m "feat(scope): description"
git push origin feature/my-feature

# Update your branch with develop (REBASE)
git checkout develop
git pull origin develop
git checkout feature/my-feature
git rebase develop
git push --force-with-lease origin feature/my-feature

# After PR is merged (use "Squash and merge" on GitHub)
# Delete local and remote branch
git checkout develop
git pull origin develop
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Useful Git Aliases (optional)

Add to your `~/.gitconfig`:
```ini
[alias]
    last = log -1 HEAD
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    # Useful for our workflow
    update = !git checkout develop && git pull && git checkout - && git rebase develop
    squash-merge = merge --squash
```
---

