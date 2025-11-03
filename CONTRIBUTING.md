# Contributing to The Most Advanced No-Ping Cloudflare Worker

First off, thank you for considering contributing to this project! It's people like you that make this worker better for everyone.

## Code of Conduct

By participating in this project, you are expected to uphold our code of conduct:
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, URLs, etc.)
- **Describe the behavior you observed** and what behavior you expected
- **Include logs and error messages** if applicable
- **Specify your environment** (Node.js version, Wrangler version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most users
- **List any alternative solutions** you've considered
- **Include examples** of how the feature would be used

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes with a clear commit message
6. Push to your fork
7. Submit a pull request

#### Pull Request Guidelines

- **Keep changes focused**: One feature or fix per PR
- **Write clear commit messages**: Use the present tense ("Add feature" not "Added feature")
- **Update documentation**: If you change functionality, update the README and other docs
- **Add tests**: If applicable, add tests for your changes
- **Follow the existing code style**: Maintain consistency with the existing codebase
- **Test before submitting**: Ensure your changes work as expected

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Wrangler CLI

### Setup Instructions

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/The-most-advanced-no-ping-cloudflare-worker.git
   cd The-most-advanced-no-ping-cloudflare-worker
   ```

2. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

3. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

4. Start development server:
   ```bash
   wrangler dev
   ```

## Code Style Guidelines

### JavaScript Style

- Use ES6+ features
- Use `const` and `let`, not `var`
- Use template literals for string interpolation
- Use arrow functions for anonymous functions
- Add comments for complex logic
- Keep functions small and focused

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names

### Example:

```javascript
// Good
const MAX_RETRY_ATTEMPTS = 3;
const userName = 'john';

function handleUserRequest(request) {
  // Implementation
}

class WebSocketHandler {
  // Implementation
}

// Bad
const max = 3;
const usrnm = 'john';

function h(r) {
  // Implementation
}

class wshandler {
  // Implementation
}
```

## Testing

### Manual Testing

Before submitting a PR, test your changes:

1. **HTTP Proxying**:
   ```bash
   curl "http://localhost:8787/?target=https://httpbin.org/get"
   ```

2. **POST Requests**:
   ```bash
   curl -X POST "http://localhost:8787/?target=https://httpbin.org/post" \
     -d '{"test":"data"}'
   ```

3. **WebSocket**:
   ```bash
   wscat -c "ws://localhost:8787/?target=wss://echo.websocket.org"
   ```

### Testing Checklist

- [ ] HTTP GET requests work correctly
- [ ] HTTP POST requests with body work correctly
- [ ] Headers are properly forwarded
- [ ] CORS headers are added
- [ ] WebSocket connections work
- [ ] Error handling works as expected
- [ ] Security headers are present

## Documentation

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change existing functionality
- Fix a bug that affects usage
- Add new configuration options
- Change API behavior

### Documentation Files

- `README.md`: Main documentation
- `EXAMPLES.md`: Usage examples
- `CONTRIBUTING.md`: This file
- Code comments: For complex logic

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(websocket): add automatic reconnection logic

Implement exponential backoff for WebSocket reconnections
with configurable max retry attempts.

Closes #123
```

```
fix(cors): add missing CORS headers for OPTIONS requests

Previously, preflight OPTIONS requests were missing some
required CORS headers, causing cross-origin requests to fail.

Fixes #456
```

## Review Process

After submitting a PR:

1. **Automated checks** will run (if configured)
2. **Maintainers will review** your code
3. **You may be asked** to make changes
4. **Once approved**, your PR will be merged

### What Reviewers Look For

- Code quality and style
- Tests (if applicable)
- Documentation updates
- Security implications
- Performance impact
- Breaking changes

## Feature Requests

Have an idea for a new feature? Great! Here's how to propose it:

1. **Check existing issues** to see if it's already been suggested
2. **Open a new issue** with the "enhancement" label
3. **Describe the feature** in detail
4. **Explain the use case** and benefits
5. **Discuss implementation** ideas (if you have any)

## Questions?

If you have questions, you can:
- Open an issue with the "question" label
- Check the README and EXAMPLES documentation
- Look through existing issues and PRs

## Recognition

Contributors will be recognized in:
- The README.md file
- Release notes
- Project documentation

Thank you for contributing! 🎉
