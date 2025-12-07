# AlgoKit lora for contributors

This is an open source project managed by the Algorand Foundation. See the [AlgoKit contributing page](https://github.com/algorandfoundation/algokit-cli/blob/main/CONTRIBUTING.md) to learn about making improvements.

## Setup

Install dependencies

```
npm install
```

Configure your environment

```
cp .env.sample .env
```

To run locally

```
npm run dev
```

Note: For the best dev experience we recommend using VSCode with the recommended extensions.

## SVG Icons

To add new svg icons, add them to the `~/src/assets/icons` directory with an appropriate kebab case name, then run the npm task `build:1-icons`. This will create a react component for each svg file found. The components will be created under `~/features/common/components/icons/**`.

There is also a folder for svgs `~/src/assets/svg` which will generate components under `~/features/common/components/svg/**` when running the task `build:2-svg`. The difference is that icons are optimised to display at `1em x 1em`, whereas svgs will display at their originally defined size.

Depending on where you have sourced the svg, you may wish to make a few tweaks to the svg file in order to make using the icon a bit easier:

- Where appropriate, replace specific colours in the svg (stroke/fill) with 'currentColor'. This will cause the icon to be rendered in the current font colour at its position in the DOM, meaning you can change the colour of the icon using the css `color: <whatever you want>`
- Tweak the viewbox so it just fits the subject, and with the subject centered vertically and horizontally. Since svgs are scalable, it doesn't matter what the actual view box are dimensions are - but if you have one icon with 50% padding around the subject and another with 10% padding - the latter will display a lot larger when rendered making it more difficult to style consistently. View boxes can contain negative values so feel free to use that to help center the subject.

## Release Management

### Versioning Strategy

Lora uses [semantic versioning](https://semver.org/) with automated releases based on [conventional commits](https://www.conventionalcommits.org/).

### Branch Strategy

- **`release`** - Production releases (stable)

  - Triggers production deployments to [lora.algokit.io](https://lora.algokit.io)
  - Creates stable releases (e.g., `v1.2.0`)

- **`main`** - Staging releases (prerelease)

  - Triggers staging deployments for testing
  - Creates beta releases (e.g., `v1.2.0-beta.1`)
  - Used for final testing before production

- **`branch-name/*`** - Dev branches
  - Created from `main` for dev work
  - Merged to `main` for testing
  - Promoted to `release` after validation

### Environments

- **Production** (`release`) - https://lora.algokit.io

  - Stable, production-ready releases
  - Full testing and validation completed
  - Used by end users and production applications

- **Staging** (`main`) - Beta deployment

  - Pre-release testing environment
  - Latest features undergoing final validation
  - Used by internal teams and beta testers

- **Development** (local) - `v0.0.0-dev`
  - Local development builds
  - Hot reloading and debug features
  - Used during active development

### Release Process

The release process follows a controlled promotion workflow with automatic version synchronization:

```
Feature branch → main → (manual promotion) → release → production
       ↓           ↓                             ↓         ↓
   PR review   Beta release                Stable release  │
              (release.yaml)              (release.yaml)   │
                                                           │
                     ←─────────────────────────────────────┘
                          Automatic sync back to main
                        (sync-release-to-main job)
```

**Workflow Details:**

1. **Development**: Create feature branches from `main`
2. **Testing**: Merge to `main` triggers beta releases (`release.yaml` - beta versions only)
3. **Promotion**: Manual promotion (`promote-to-production.yml`) merges `main` → `release`
4. **Production**: Release to `release` branch triggers production deployment (`release.yaml` - full deployment)
5. **Synchronization**: After production release, version is automatically synced back to `main`

**Key Workflows:**

- `promote-to-production.yml` - Manual promotion from main to release
- `release.yaml` - Release orchestrator (handles both beta releases on main and production releases on release)
- `sync-release-to-main` - Automatic version synchronization back to main (part of release.yaml)

**Branch Behavior:**

- **Main branch**: `release.yaml` creates beta versions (e.g., `v1.2.0-beta.1`) but doesn't deploy to production
- **Release branch**: `release.yaml` creates stable versions (e.g., `v1.2.0`) and deploys to production

This ensures that:

- All environments stay in sync with consistent version numbers
- The next beta cycle starts from the correct version base
- Release tags are properly maintained across both branches
