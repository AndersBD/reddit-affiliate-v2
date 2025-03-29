# Contributing to Reddit Affiliate Opportunity Engine

First off, thank you for considering contributing to the Reddit Affiliate Opportunity Engine! It's people like you that make this project such a great tool for affiliate marketers and entrepreneurs.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand what kind of behavior is expected.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report**

* Check the [issues](https://github.com/yourusername/reddit-affiliate-opportunity-engine/issues) to see if the bug has already been reported
* Try the latest version of the software to see if the bug has been fixed
* Determine which repository the problem should be reported in

**How Do I Submit A (Good) Bug Report?**

Bugs are tracked as [GitHub issues](https://github.com/yourusername/reddit-affiliate-opportunity-engine/issues). Create an issue and provide the following information:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain what behavior you expected to see instead
* Include screenshots and animated GIFs if possible
* Include details about your configuration and environment

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

**Before Submitting An Enhancement Suggestion**

* Check if the enhancement has already been suggested or implemented
* Check if there's a package or tool that already provides this enhancement

**How Do I Submit A (Good) Enhancement Suggestion?**

Enhancement suggestions are tracked as GitHub issues. Create an issue and provide the following information:

* Use a clear and descriptive title
* Provide a detailed description of the suggested enhancement
* Explain why this enhancement would be useful to most users
* Specify which part of the application this enhancement would affect
* List some other applications where this enhancement exists, if applicable

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

* [Beginner issues](https://github.com/yourusername/reddit-affiliate-opportunity-engine/labels/beginner) - issues which should only require a few lines of code
* [Help wanted issues](https://github.com/yourusername/reddit-affiliate-opportunity-engine/labels/help%20wanted) - issues which should be a bit more involved than `beginner` issues

### Pull Requests

Follow these steps to have your contribution considered by the maintainers:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

**Pull Request Guidelines**

* Follow the coding style and formatting used throughout the project
* Include tests for new features or bug fixes
* Update documentation accordingly
* Keep pull requests focused on a single concern
* Link any relevant issues in the pull request description
* Be open to feedback and be willing to make changes to your pull request

## Development Setup

To set up the project for local development:

1. Install prerequisites:
   - Node.js 20+
   - .NET SDK 8.0+
   - PostgreSQL

2. Fork and clone the repository:
   ```
   git clone https://github.com/YOUR_USERNAME/reddit-affiliate-opportunity-engine.git
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file with your local configuration

5. Set up the database:
   ```
   npm run db:push
   ```

6. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

Understanding the project structure will help you contribute more effectively:

- `/client` - React frontend application
- `/server` - Express.js API server
- `/Backend` - .NET 8 crawler application
- `/shared` - Shared schemas and types
- `/docs` - Project documentation

## Coding Standards

### JavaScript/TypeScript

- Follow the ESLint configuration
- Use TypeScript types for all new code
- Write JSDoc comments for functions and classes
- Use functional components with hooks for React code

### C# / .NET

- Follow Microsoft's C# coding conventions
- Use async/await for asynchronous operations
- Implement interfaces for better dependency injection
- Write unit tests for business logic

## Testing

Please write tests for any new features or bug fixes:

- For frontend components, use Vitest
- For .NET code, use xUnit
- Aim for at least 80% code coverage for new features

## Documentation

Documentation is crucial for this project:

- Update the README.md if you change required dependencies or installation steps
- Document all new API endpoints
- Add inline code comments explaining complex logic
- Update any relevant documentation files in the `/docs` directory

---

Thank you for your contributions!