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

// Read Cargo.lock
const cargoLockPath = path.join(__dirname, '../src-tauri/Cargo.lock')
let cargoLock = fs.readFileSync(cargoLockPath, 'utf8')

// Extract current version from Cargo.lock for algokit-lora package
const lockCurrentVersionMatch = cargoLock.match(/\[\[package\]\]\s*\nname = "algokit-lora"\s*\nversion = "(.+?)"/s)
const lockCurrentVersion = lockCurrentVersionMatch ? lockCurrentVersionMatch[1] : 'unknown'

console.log(`🔒 Current Cargo.lock version: ${lockCurrentVersion}`)

// Update version in Cargo.lock for algokit-lora package
cargoLock = cargoLock.replace(/(\[\[package\]\]\s*\nname = "algokit-lora"\s*\nversion = ")([^"]+)(")/s, `$1${newVersion}$3`)

// Write updated Cargo.lock
fs.writeFileSync(cargoLockPath, cargoLock)

if (currentVersion === newVersion && lockCurrentVersion === newVersion) {
  console.log(`✅ Versions already synchronized at ${newVersion}`)
} else {
  console.log(`✅ Updated Cargo.toml version: ${currentVersion} → ${newVersion}`)
  console.log(`✅ Updated Cargo.lock version: ${lockCurrentVersion} → ${newVersion}`)
}

// Verify the changes were applied correctly
const updatedCargoToml = fs.readFileSync(cargoTomlPath, 'utf8')
const verifyVersionMatch = updatedCargoToml.match(/^version = "(.+)"$/m)
const verifyVersion = verifyVersionMatch ? verifyVersionMatch[1] : 'unknown'

const updatedCargoLock = fs.readFileSync(cargoLockPath, 'utf8')
const verifyLockVersionMatch = updatedCargoLock.match(/\[\[package\]\]\s*\nname = "algokit-lora"\s*\nversion = "(.+?)"/s)
const verifyLockVersion = verifyLockVersionMatch ? verifyLockVersionMatch[1] : 'unknown'

if (verifyVersion !== newVersion || verifyLockVersion !== newVersion) {
  console.error(`❌ Cargo.toml version sync failed! Expected ${newVersion}, got ${verifyVersion}`)
  console.error(`❌ Cargo.lock version sync failed! Expected ${newVersion}, got ${verifyLockVersion}`)
  process.exit(1)
}

console.log(`🎉 Version synchronization complete!`)
