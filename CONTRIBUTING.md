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
