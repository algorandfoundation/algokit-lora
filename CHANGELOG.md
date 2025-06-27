# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Features

- Comprehensive versioning system with staging and production environments
- Automated semantic versioning based on conventional commits
- Enhanced version display in Settings page with environment indicators
- Unified version management for both web and desktop applications
- Version synchronization between package.json and Cargo.toml
- Automated deployment workflows for staging and production

### 🔧 Internal

- Added version environment variables and configuration system
- Enhanced semantic-release configuration for multi-environment support
- Created reusable version display components and hooks
- Comprehensive test coverage for version management features
- Bot token authentication across all workflows
- Version injection into build processes

---

## About This Changelog

This changelog is automatically maintained by [semantic-release](https://github.com/semantic-release/semantic-release) based on [conventional commits](https://www.conventionalcommits.org/).

### Commit Types

- **feat**: ✨ New features
- **fix**: 🐛 Bug fixes
- **docs**: 📝 Documentation changes
- **style**: 💄 Code style changes
- **refactor**: ♻️ Code refactoring
- **perf**: ⚡ Performance improvements
- **test**: 🧪 Test changes
- **chore**: 🔧 Internal/maintenance changes

### Release Channels

- **Production**: Stable releases from `main` branch (e.g., `v1.2.0`)
- **Beta**: Pre-release versions from `staging` branch (e.g., `v1.2.0-beta.1`)
