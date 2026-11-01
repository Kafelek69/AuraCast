# 🤝 Contributing to AuraCast

Thank you for your interest in contributing to **AuraCast**! AuraCast is a 100% community-driven, open-source live-streaming platform built on the principles of digital freedom and independent monetization.

---

## 🧭 Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Be respectful, constructive, and open to feedback.

---

## 🛠️ Branching Strategy
When contributing, always branch off from the latest `main` branch using standard naming prefixes:

- `feature/short-description` – New features or enhancements (e.g. `feature/whisper-chat-drawer`)
- `fix/short-description` – Bug fixes and patches (e.g. `fix/rtmp-latency-drop`)
- `docs/short-description` – Documentation updates or guides (e.g. `docs/nginx-ssl-setup`)
- `refactor/short-description` – Code refactoring or architectural improvements
- `perf/short-description` – Performance optimizations

Example:
```bash
git checkout -b feature/stream-categories-filter
```

---

## 📝 Commit Conventions (Conventional Commits)
All commit messages must adhere to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types:
- `feat:` A new user-facing feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (formatting, white-space)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools/libraries

### Examples:
- `feat(chat): add real-time emote picker support`
- `fix(player): resolve flv playback promise rejection`
- `docs(readme): add docker deployment instructions and badges`

---

## 🧪 Local Quality Checks (Linter & Typecheck)
Before opening a Pull Request, ensure that your code passes all type checks and builds cleanly without warnings:

### Backend Checks:
```bash
cd backend
npm run build
```

### Frontend Checks:
```bash
cd frontend
npm run lint
npm run build
```

---

## 🚀 Pull Request Workflow

1. **Fork** the repository and clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AuraCast.git
   cd AuraCast
   ```
2. **Create a topic branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**, keeping them focused and atomic.
4. **Test thoroughly** both in local development (`npm run dev`) and production build mode.
5. **Commit your changes** following Conventional Commits.
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** against the `main` branch of `AuraCast/AuraCast`. Fill in the PR template thoroughly.