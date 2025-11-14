# Contributing to Planning Poker Online

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (browser, OS, etc.)

### Suggesting Enhancements

We welcome feature requests! Please open an issue with:
- A clear description of the feature
- The problem it solves
- How you envision it working
- Any examples or mockups

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**
   ```bash
   npm run dev
   npm run type-check
   npm run lint
   ```
5. **Commit with a clear message**
   ```bash
   git commit -m "Add: feature description"
   ```
   Use prefixes: `Add:`, `Fix:`, `Update:`, `Refactor:`, `Docs:`
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**
   - Describe what you changed and why
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

See [README.md](README.md#getting-started) for full setup instructions.

## Code Style

- **TypeScript:** Use strict typing
- **Components:** Functional components with hooks
- **Naming:**
  - Components: `PascalCase`
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: Match component name
- **Formatting:** Prettier (automatic)
- **Linting:** ESLint (run `npm run lint`)

## Areas for Contribution

- 🐛 Bug fixes
- ✨ New features (from roadmap or your ideas)
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌍 Internationalization (i18n)
- ⚡ Performance optimizations
- 🧪 Test coverage

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

Thank you for making Planning Poker Online better! 🙏
