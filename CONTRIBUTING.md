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

To run the web version locally

```
npm run dev
```

To run the app version locally

```
npm run tauri dev
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

Lora uses [semantic versioning](https://semver.org/) with automated releases based on [conventional commits](https://www.conventionalcommits.org/). Our versioning system supports both web and desktop applications with synchronized version numbers.

### Branch Strategy

- **`release`** - Production releases (stable)

  - Triggers production deployments to [lora.algokit.io](https://lora.algokit.io)
  - Creates stable releases (e.g., `v1.2.0`)
  - Desktop releases are built and distributed

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

```
Feature branch → main → (manual promotion) → release → production
       ↓           ↓                             ↓
   PR review   Beta release                Stable release
              (staging-deployment.yml)    (release-web.yaml)

Manual promotion: promote-to-production.yml
Manual Desktop releases: release.yaml
```
