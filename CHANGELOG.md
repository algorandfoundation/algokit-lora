# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0](https://github.com/algorandfoundation/algokit-lora/compare/v2.2.1...v2.3.0) (2026-02-04)

### ♻️ Code Refactoring

* rename resolveSenderAddress to resolveTransactionSender and improve optional sender handling ([aa66da7](https://github.com/algorandfoundation/algokit-lora/commit/aa66da7582fe1de17edfc4c8804051c41acba013))
* **resolve_address:** refactor the resolve sender address to simplify the function and make it named export ([bb29210](https://github.com/algorandfoundation/algokit-lora/commit/bb292107d32327757284424768f51a91fa5c7eb4))
* **use-search-params:** refactor transactions wizard page test to use case wallet variables instead of test suite walletAddress ([444a3cf](https://github.com/algorandfoundation/algokit-lora/commit/444a3cfc73f589b22b2f54beb0283caa0445ef65))
* **use-search-params:** refactor use search params transaction to use jotai for async auto population ([fb2a694](https://github.com/algorandfoundation/algokit-lora/commit/fb2a694d171cafb974e7c7ab28ca9efd973e95b2))

### 🐛 Bug Fixes

* add try catch to handle app state decode error ([ed1b91e](https://github.com/algorandfoundation/algokit-lora/commit/ed1b91e4ec0bb65ae5ac8d43b47813028891213e))
* double scroll bar when viewing application programs ([dbc8c04](https://github.com/algorandfoundation/algokit-lora/commit/dbc8c0457be85a7f53be4be5f18837b583b8032b))
* fix dispenser spelling+ small refactors ([748168e](https://github.com/algorandfoundation/algokit-lora/commit/748168e42298742b42b9223e5e49753e0a02dfec))
* fix download button blocking txn click txn graph ([199ef67](https://github.com/algorandfoundation/algokit-lora/commit/199ef6708086ae269d0b8dc70ac98de8cc1114aa))
* fix failing tests for auto populating and simulating transactions ([4f57874](https://github.com/algorandfoundation/algokit-lora/commit/4f578742dada019c59f8f2d1ad89ecaddc678371))
* fix npm audit error by extending acceptance of vulnerability ([887c88c](https://github.com/algorandfoundation/algokit-lora/commit/887c88c24e4f03e9d272f91d9d6624a2719616a7))
* fix npm audit error by extending acceptance of vulnerability ([c81b576](https://github.com/algorandfoundation/algokit-lora/commit/c81b57640d629bc4846eab7d83e9ad6c05266991))
* ignore npm audit issue 1112255 ([797c242](https://github.com/algorandfoundation/algokit-lora/commit/797c2425d1d893c79b4da33caeb8b6b3527036ce))
* lint error blocking CI ([55986c0](https://github.com/algorandfoundation/algokit-lora/commit/55986c0ec96ab972aef9330a235fa254aafb925f))
* npm audit (ignore them) ([#556](https://github.com/algorandfoundation/algokit-lora/issues/556)) ([58b9b5d](https://github.com/algorandfoundation/algokit-lora/commit/58b9b5d02739d2776e3c9ca2b2c18489b7585269))
* qs audit issue ([2f51435](https://github.com/algorandfoundation/algokit-lora/commit/2f51435faad2ca0e20605692a4d09c5e178bb48d))
* remove remaining Tauri remnants ([#535](https://github.com/algorandfoundation/algokit-lora/issues/535)) ([85b94b9](https://github.com/algorandfoundation/algokit-lora/commit/85b94b9588d56d00ffd250d5570c21777964d09b))
* **search_params:** fix two tests that were failing only on CI/CD ([669d16f](https://github.com/algorandfoundation/algokit-lora/commit/669d16fd2685e55f8e40ed320309052fec7241aa))
* **test:** add racing condition to wait asset-opt out render before testing ([799967c](https://github.com/algorandfoundation/algokit-lora/commit/799967c4b0ef3675557b49cc321ab6c86c888e7b))
* **test:** add racing condition to wait render before testing ([a874ce9](https://github.com/algorandfoundation/algokit-lora/commit/a874ce91de1f0cb38e28735458bf42b4e83aa6a8))
* **test:** add racing condition to wait render before testing ([02b70e6](https://github.com/algorandfoundation/algokit-lora/commit/02b70e6603235be5c436c1d1369768ba0b27f177))
* upgrade semantic-release to fix npm audit ([b85ce52](https://github.com/algorandfoundation/algokit-lora/commit/b85ce52c863a6225efa440ddeb4df0cf1687fb25))
* upgrade to react-router-dom@6.30.3 to fix npm audit ([20ecf40](https://github.com/algorandfoundation/algokit-lora/commit/20ecf405b7658df8f177e6dc3c3f537fb07fe456))
* use setError in app details too ([684d762](https://github.com/algorandfoundation/algokit-lora/commit/684d7624f51521fe68e0bdd081cea9dcb59b38ec))
* use setError instead of trigger to show validation error ([eba8ac0](https://github.com/algorandfoundation/algokit-lora/commit/eba8ac070b4a7e2f0b9e6c80d0bf7bd4eebfc0ad))

### 🚀 Features

* **optional_sender:** Add optional sender at latest squashed to solve unsigned commits ([0e78c0f](https://github.com/algorandfoundation/algokit-lora/commit/0e78c0f6549564062ce121241b4f69f6b2d184e8))
* **transaction-wizard:** auto-populate sender from localnet dispenser in URL params ([fac30c1](https://github.com/algorandfoundation/algokit-lora/commit/fac30c16c963fa3b9af1fbe11e405245a565db90))

## [2.2.1](https://github.com/algorandfoundation/algokit-lora/compare/v2.2.0...v2.2.1) (2025-11-24)

### ♻️ Code Refactoring

* **latest_cards:** refactor latest blocks card to use flex layout instead of margins ([aba9cee](https://github.com/algorandfoundation/algokit-lora/commit/aba9ceeaa08b6f8bd8529603ff4ab2445aa1ee38))

### 🐛 Bug Fixes

* **actions_overflow:** fix action buttons being cut on the wizard form ([48379a9](https://github.com/algorandfoundation/algokit-lora/commit/48379a96c19070839dc6a3316dc20623d80ff31a))
* **app_call_table:** fix app call table to display important data even on mobile ([cb99a81](https://github.com/algorandfoundation/algokit-lora/commit/cb99a814a4db649fb2521e3d2356c9e64119b76e))
* **build:** fix build errors ([85b3734](https://github.com/algorandfoundation/algokit-lora/commit/85b37346a4d2e4e0d0c01f3bf8605ef8724e6850))
* convert AVMBytes template parameters from base64 to Uint8Array ([50a038f](https://github.com/algorandfoundation/algokit-lora/commit/50a038f73d07d2c672f2128a0926b2ecfa6392e6))
* Decoded ABI Args now render an address the same as an account ([23fbf9a](https://github.com/algorandfoundation/algokit-lora/commit/23fbf9a8c126d351ce5842b13852ea6b34e995a9))
* **dependencies:** fix jotai and semantic release dependencies for CI ([80fded7](https://github.com/algorandfoundation/algokit-lora/commit/80fded73e72cfceb78042f3b67d74b567eec8e22))
* **double_heading:** remove unnecessary heading that was breaking tests ([debf512](https://github.com/algorandfoundation/algokit-lora/commit/debf512e75e5b4d34e5fe2a2f9a335472e10ee48))
* **mobile:** fix few reviews on previous comment ([4f6ec74](https://github.com/algorandfoundation/algokit-lora/commit/4f6ec7437a5f18da3944c1ed8cd4ae49039d46f4))
* npm audit ([#525](https://github.com/algorandfoundation/algokit-lora/issues/525)) ([130cb15](https://github.com/algorandfoundation/algokit-lora/commit/130cb15fe38b02679f1a34d0b4403a0d9aaa4804))
* **package-lock:** fix package lock not being in sync with package.json breaking CI ([b615b68](https://github.com/algorandfoundation/algokit-lora/commit/b615b68572e78424c9e2306af880d50b6c307546))
* **package-lock:** fix package lock to use jotai 2.7 + sync package.json ([2aacbbc](https://github.com/algorandfoundation/algokit-lora/commit/2aacbbc308e7123c99a2727f97a9e0a6ed6fbed5))
* **package:** fix package-lock to reflect tailwind deps 4.16^ + fix recurring build errors ([65d6cd5](https://github.com/algorandfoundation/algokit-lora/commit/65d6cd585e6a819ce88f7417a99f8cf1fd21a39e))
* prevent validation errors from obstructing help text and add address field help text ([b04f9f9](https://github.com/algorandfoundation/algokit-lora/commit/b04f9f913326cc56100ca2a8755bf4962d1fa9d6))
* support assets which signal arc3 conformance using asset name ([c467165](https://github.com/algorandfoundation/algokit-lora/commit/c4671658d58ea11ad6638849df7f438d1034f018))
* **tables:** fix table layouts and fields to correctly scroll and display important fields ([e7a51ec](https://github.com/algorandfoundation/algokit-lora/commit/e7a51ecedfd6cdd5739eb5dc0b0c947dcaff2f50))
* trigger application interface name validation when interface exists ([8a4b168](https://github.com/algorandfoundation/algokit-lora/commit/8a4b168acf2627c49674c507e01233d28c6820cc))
* use new-release-version rather than new-release-git-tag, which does not exist ([b5a9a72](https://github.com/algorandfoundation/algokit-lora/commit/b5a9a728b69a01c950384cfb236b7f1b51b2c832))

## [2.2.0](https://github.com/algorandfoundation/algokit-lora/compare/v2.1.1...v2.2.0) (2025-10-29)

### 🐛 Bug Fixes

* **linter:** fix tailwind lint server not working inside react components ([7b0990d](https://github.com/algorandfoundation/algokit-lora/commit/7b0990da0cac83c62f9fbd100dbf9d9be15d3e1f))
* **modals:** fix animation of the modals + remove comments ([cb56025](https://github.com/algorandfoundation/algokit-lora/commit/cb56025fa4ff58ea8bda02f81aa72bf7133a6395))

### 🚀 Features

* **drawer_menu:** finish implementing drawer menu to fix layout in mobile ([8fff982](https://github.com/algorandfoundation/algokit-lora/commit/8fff9828ee5177b5148818552adcd137ee1f45f7))

## [2.1.1](https://github.com/algorandfoundation/algokit-lora/compare/v2.1.0...v2.1.1) (2025-09-27)

### 🐛 Bug Fixes

* resolve netlify deploy issue ([#502](https://github.com/algorandfoundation/algokit-lora/issues/502)) ([9cd254d](https://github.com/algorandfoundation/algokit-lora/commit/9cd254d60c074c281cbb032621e1d474c5b20b59))

## [2.1.0](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.8...v2.1.0) (2025-09-27)

### ⏪ Reverts

* ak utils future ([#489](https://github.com/algorandfoundation/algokit-lora/issues/489)) ([ada3049](https://github.com/algorandfoundation/algokit-lora/commit/ada3049a6ea57a39470d4984cf36ac0831599bc7)), closes [#422](https://github.com/algorandfoundation/algokit-lora/issues/422)

### 🐛 Bug Fixes

* order transaction summary types ([#490](https://github.com/algorandfoundation/algokit-lora/issues/490)) ([fc1b3b3](https://github.com/algorandfoundation/algokit-lora/commit/fc1b3b38e828da7c30c619ce9d18fb42fd0860bc))
* update algosdk to latest to ensure new transaction fields are accounted for ([#501](https://github.com/algorandfoundation/algokit-lora/issues/501)) ([1616db8](https://github.com/algorandfoundation/algokit-lora/commit/1616db87d541ca53d317b3e5e8d0b18f087342ff))

### 🚀 Features

* add support for rendering arc62 circulating supply of an asset ([68074c9](https://github.com/algorandfoundation/algokit-lora/commit/68074c95e0ae39d2fde8495d17109f373de71510))

## [2.0.8](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.7...v2.0.8) (2025-08-05)

### 🐛 Bug Fixes

* resolve issues with desktop release ([#485](https://github.com/algorandfoundation/algokit-lora/issues/485)) ([09d2d22](https://github.com/algorandfoundation/algokit-lora/commit/09d2d22d4fb9d88e7ee77e34010fb56d9724a748))

## [2.0.7](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.6...v2.0.7) (2025-07-31)

### 🐛 Bug Fixes

* revered back to using GITHUB_TOKEN ([#481](https://github.com/algorandfoundation/algokit-lora/issues/481)) ([ba6fe12](https://github.com/algorandfoundation/algokit-lora/commit/ba6fe12d88d3480d4d7ba8ddfa200eba504b6526))

## [2.0.6](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.5...v2.0.6) (2025-07-30)

### 🐛 Bug Fixes

* reorder steps ([#480](https://github.com/algorandfoundation/algokit-lora/issues/480)) ([491c692](https://github.com/algorandfoundation/algokit-lora/commit/491c692794aa5b7033e3ff255202f031752a420d))

## [2.0.5](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.4...v2.0.5) (2025-07-30)

## [2.0.4](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.3...v2.0.4) (2025-07-30)

### 🐛 Bug Fixes

* added secrets to workflow_call workflows ([6b38e22](https://github.com/algorandfoundation/algokit-lora/commit/6b38e222e288a6a89d1548dd9d5c88f6128c4edc))

## [2.0.3](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.2...v2.0.3) (2025-07-28)

### 🐛 Bug Fixes

* more logging to debug releaes ([84a40b8](https://github.com/algorandfoundation/algokit-lora/commit/84a40b8f503bcef5b6f86995b311201e4ac5d4cf))

## [2.0.2](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.1...v2.0.2) (2025-07-28)

### 🐛 Bug Fixes

* added debuging to test ci ([a88fef1](https://github.com/algorandfoundation/algokit-lora/commit/a88fef117d4cbecdb353178409b69eb4aa849486))

## [2.0.1](https://github.com/algorandfoundation/algokit-lora/compare/v2.0.0...v2.0.1) (2025-07-25)

### 🐛 Bug Fixes

* crab nebula release version ([c68190f](https://github.com/algorandfoundation/algokit-lora/commit/c68190f9bb1db6efa2c2f20219b07d61f4d245b1))

## [2.0.0](https://github.com/algorandfoundation/algokit-lora/compare/v1.2.0...v2.0.0) (2025-07-25)

### ⚠ BREAKING CHANGES

* Branching strategy has changed. Production deployments now use 'release' branch, staging uses 'main' branch.

New workflow:
- Feature branches → main (staging environment, beta releases)
- main → release (production environment, stable releases)

- Changed production deployments to trigger on 'release' branch instead of 'main'
- Updated staging deployments to trigger on 'main' branch instead of 'staging'
- Modified promotion workflow to merge 'main' → 'release' instead of 'staging' → 'main'
- Updated semantic-release configuration to create stable releases from 'release' branch and beta releases from 'main'

* docs: add workflow descriptions and update release process documentation

- Added detailed descriptions to all GitHub Actions workflow files explaining their role
- Updated README.md release process section with workflow file names for each step
- Clarified staging deployment uses Cloudflare Pages and desktop releases are manual

All workflows now clearly document when they trigger, what they do, and their role in the release process.

* refactor: removed version env vars

* chore(config): convert semantic-release to TypeScript and optimize configuration

* feat(ci): implement orchestrator release workflow for unified web and desktop releases

• Add orchestrator pattern to coordinate web and desktop releases from single workflow
• Create reusable release-desktop.yaml workflow for cross-platform desktop builds
• Implement efficient build strategy: build frontend once, reuse across all platforms
• Fix semantic-release to upload web artifacts to GitHub releases
• Simplify environment configuration with direct production values
• Add tauri:build convenience script and remove beforeBuildCommand from tauri.conf.json

* chore(docs): moved release info to CONTRIBUTING.md

* test: consolidate settings tests at page level

* chore: adjust the build layout and apply some fixes

* refactor(ci): combine build-app and create-release into single job

- Eliminate duplicate Node.js setup and npm install steps
- Combine build-app and create-release into build-and-release job
- Optimize workflow execution flow: version → sync → commit → build
- Update job dependencies to use single upstream job

refactor: rename create-release action to generate-release-version

* feat: use branch name instead of semantic-release output for production release detection

- Add IS_PRODUCTION_RELEASE environment variable for consistency
- Replace release-published checks with github.ref_name == 'release'

* fix: updated release.yml

* fix: handle breaking changes and cleaned main git history

* chore(ci): removed dependency on release web for sync to main

* chore: removed unused workflow output

* chore: uncommented used code

* refactor: removed keywords parseOpts

* docs: updated contributing guide

* refactor: release config ts to conditionally update changelog only on release branch

* Add versioning  ([#452](https://github.com/algorandfoundation/algokit-lora/issues/452)) ([2e82736](https://github.com/algorandfoundation/algokit-lora/commit/2e82736ce80c557549b479b7e2efd562b6e71aa7))

### ♻️ Code Refactoring

* removed unused clawback field for asset opt-in txn ([5c0623c](https://github.com/algorandfoundation/algokit-lora/commit/5c0623cd9fe1d91b42f68595d923f62f11db4771))
* removed unused clawback field for asset opt-out txn ([28eb31f](https://github.com/algorandfoundation/algokit-lora/commit/28eb31fbf3ed23a52627be5226cac4409fa4edb4))

### 🐛 Bug Fixes

* Add back copy button on Application Link ([df56770](https://github.com/algorandfoundation/algokit-lora/commit/df56770173ad8389f6f87bd8a2737959cc95f806))
* correctly handle b64 asset names which are utf8 strings ([eef7a70](https://github.com/algorandfoundation/algokit-lora/commit/eef7a707a8c843d0430e4c9eec49f672f8bcab06))
* npm audit ([61191ed](https://github.com/algorandfoundation/algokit-lora/commit/61191ed5cc8cb0163af0d246dbd2eb9baf768bbb))
* patch algosdk so deleted applications can be fetched ([7980e4c](https://github.com/algorandfoundation/algokit-lora/commit/7980e4c9773982d8761faea1184524cc72ace9b9))
* simplify application box data handling with direct base64 encoding ([fbe6688](https://github.com/algorandfoundation/algokit-lora/commit/fbe668885efd75b055ca8bc38f42b18d7fd83f00))
* support visuals for rekeys from app accounts to user accounts ([#453](https://github.com/algorandfoundation/algokit-lora/issues/453)) ([50803c9](https://github.com/algorandfoundation/algokit-lora/commit/50803c987c9a76e63dfaeddb89420c6052cae794))
* updated deps to fix vunerabilities ([16fe71e](https://github.com/algorandfoundation/algokit-lora/commit/16fe71ec22635f5ed1ce4faee0ca75be15d039f0))
* used default import for tailwind animate ([824f50f](https://github.com/algorandfoundation/algokit-lora/commit/824f50fc3c66d63bf54c1439e59d252d5df31e11))
* vite vunerability ([59ff1cd](https://github.com/algorandfoundation/algokit-lora/commit/59ff1cd7af51adda56a384f4449f5ded2123299a))

### 🚀 Features

* add QR code display for Algorand addresses ([f165af7](https://github.com/algorandfoundation/algokit-lora/commit/f165af707cacab6f3cf7f002f2725a242ebe3163))
* add support for viewing application local state ([#456](https://github.com/algorandfoundation/algokit-lora/issues/456)) ([7235e66](https://github.com/algorandfoundation/algokit-lora/commit/7235e6635f8e6f989dd3ebb37285972469e1cf1c))
* added asset clawback and tests ([4b785ff](https://github.com/algorandfoundation/algokit-lora/commit/4b785ff914c168914814a23f1c3487989ec09624))
* added asset create txn to url search params ([0adf6d4](https://github.com/algorandfoundation/algokit-lora/commit/0adf6d42a572206885bba18a94dd6ad928888ded))
* added asset destroy and tests ([e1bb99e](https://github.com/algorandfoundation/algokit-lora/commit/e1bb99ed93501b299113a2067cb98f479f1064b0))
* added asset freeze and tests ([dff04e7](https://github.com/algorandfoundation/algokit-lora/commit/dff04e7e32330c6512c4f84f21ae47428166ffd6))
* added asset opt-in and tests ([b4ec556](https://github.com/algorandfoundation/algokit-lora/commit/b4ec556c3f8eeb3efc0d98b114614e43e93e29cf))
* added asset opt-out and tests ([c5d85d8](https://github.com/algorandfoundation/algokit-lora/commit/c5d85d869ca504043f8d75f73dec752c100d01be))
* added asset reconfigure and tests ([f5a3a20](https://github.com/algorandfoundation/algokit-lora/commit/f5a3a20fb2e901b24363575b78681168f0da39b7))
* added asset transfer and tests ([9a612a1](https://github.com/algorandfoundation/algokit-lora/commit/9a612a14e8650e52cfe81d7aaf242c4b9a5dbdfb))
* added payment txn url search params ([6687005](https://github.com/algorandfoundation/algokit-lora/commit/6687005d61f1bbf1617b45b9150b537b85812b61))
* Added plausible custom events ([#389](https://github.com/algorandfoundation/algokit-lora/issues/389)) ([0ec0206](https://github.com/algorandfoundation/algokit-lora/commit/0ec0206bae71f94058925686a3a88c022dd66237))
* Added plausible snippet ([#388](https://github.com/algorandfoundation/algokit-lora/issues/388)) ([e5c3ec2](https://github.com/algorandfoundation/algokit-lora/commit/e5c3ec241bc797f9def43ebd99f44b38cfca9a58))
* adjust how we visually represent transactions from rekeyed accounts ([5c5b159](https://github.com/algorandfoundation/algokit-lora/commit/5c5b159757455c6be7baefbc7ebdbac43c011cc8))
* app create/update ([e449ffb](https://github.com/algorandfoundation/algokit-lora/commit/e449ffb87a14586cacc51b70e3b759effa60d838))
* integrate QR code button in account information displays ([3464193](https://github.com/algorandfoundation/algokit-lora/commit/3464193ae496c470d00bceb3dfc5f799f22deead))
* integrate QR code functionality alongside existing copy buttons in AccountLink components ([bf87ca3](https://github.com/algorandfoundation/algokit-lora/commit/bf87ca3b8c3d48fbe0b51c96911cbb8417c9d0d1))
* render payment txn with close remainder ([dbe6648](https://github.com/algorandfoundation/algokit-lora/commit/dbe664846918b760fc9b6bbb00e71b65fcb56623))
* show app update label ([4b6cf20](https://github.com/algorandfoundation/algokit-lora/commit/4b6cf20195826e6249352a3596629f58be7841fa))
* update subscriber which enables block reward synthetic transactions ([bcc81a1](https://github.com/algorandfoundation/algokit-lora/commit/bcc81a121d26c7472f147bd91981b6be55163eb2))

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
