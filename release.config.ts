import type { Options } from 'semantic-release'

// Define commit types with their release behavior and changelog appearance
const commitTypes = {
  feat: { release: 'minor', section: '🚀 Features', hidden: false },
  fix: { release: 'patch', section: '🐛 Bug Fixes', hidden: false },
  perf: { release: 'patch', section: '⚡ Performance Improvements', hidden: false },
  revert: { release: 'patch', section: '⏪ Reverts', hidden: false },
  refactor: { release: 'patch', section: '♻️ Code Refactoring', hidden: false },
  docs: { release: false, section: '📚 Documentation', hidden: false },
  style: { release: false, section: '💄 Styles', hidden: true },
  chore: { release: false, section: '🔧 Chores', hidden: true },
  build: { release: false, section: '📦 Build System', hidden: true },
  ci: { release: false, section: '👷 CI/CD', hidden: true },
  test: { release: false, section: '✅ Tests', hidden: true },
} as const

// Special case: docs with readme scope should trigger release
const specialReleaseRules = [{ type: 'docs', scope: 'readme', release: 'patch' }]

const config: Options = {
  branches: [
    { name: 'release', channel: 'stable' },
    { name: 'main', channel: 'beta', prerelease: 'beta' },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          ...specialReleaseRules, // more specific first
          ...Object.entries(commitTypes).map(([type, config]) => ({
            type,
            release: config.release,
          })),
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: Object.entries(commitTypes).map(([type, config]) => ({
            type,
            section: config.section,
            hidden: config.hidden,
          })),
        },
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        writerOpts: {
          groupBy: 'type',
          commitGroupsSort: 'title',
          commitsSort: ['scope', 'subject'],
        },
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog\n\nAll notable changes to this project will be documented in this file.',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json', 'src-tauri/Cargo.toml'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment: true,
        failTitle: false,
        assets: [{ path: 'dist/**', label: 'Web Application Build' }],
        addReleases: 'bottom',
      },
    ],
    'semantic-release-export-data',
  ],
}

export default config
