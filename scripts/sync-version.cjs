#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
/* global console, process, __dirname, require */

const fs = require('fs')
const path = require('path')

/**
 * Synchronizes version from package.json to src-tauri/Cargo.toml
 * This ensures web and desktop versions stay in sync during builds
 *
 * Usage:
 * - Automatically called during release process to commit version changes
 * - Can be run manually during development: npm run sync-version
 */

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const newVersion = packageJson.version

console.log(`📦 Current package.json version: ${newVersion}`)

// Read Cargo.toml
const cargoTomlPath = path.join(__dirname, '../src-tauri/Cargo.toml')
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8')

// Extract current version from Cargo.toml
const currentVersionMatch = cargoToml.match(/^version = "(.+)"$/m)
const currentVersion = currentVersionMatch ? currentVersionMatch[1] : 'unknown'

console.log(`🦀 Current Cargo.toml version: ${currentVersion}`)

// Update version in Cargo.toml
cargoToml = cargoToml.replace(/^version = ".*"$/m, `version = "${newVersion}"`)

// Write updated Cargo.toml
fs.writeFileSync(cargoTomlPath, cargoToml)

if (currentVersion === newVersion) {
  console.log(`✅ Versions already synchronized at ${newVersion}`)
} else {
  console.log(`✅ Updated Cargo.toml version: ${currentVersion} → ${newVersion}`)
}

// Verify the change was applied correctly
const updatedCargoToml = fs.readFileSync(cargoTomlPath, 'utf8')
const verifyVersionMatch = updatedCargoToml.match(/^version = "(.+)"$/m)
const verifyVersion = verifyVersionMatch ? verifyVersionMatch[1] : 'unknown'

if (verifyVersion !== newVersion) {
  console.error(`❌ Version sync failed! Expected ${newVersion}, got ${verifyVersion}`)
  process.exit(1)
}

console.log(`🎉 Version synchronization complete!`)
