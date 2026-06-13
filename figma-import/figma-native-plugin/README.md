# Figma Native Import Plugin

This local Figma plugin recreates the AI Task Runner frontend as native editable Figma layers.

## How To Use

1. Open the Figma desktop app. Do not use Figma in a browser for this local manifest workflow.
2. Open a design file.
3. Go to `Plugins -> Development -> Import plugin from manifest...`.
4. Select:
   `E:\Codex-workespace\Project1\figma-import\figma-native-plugin\manifest.json`
5. Run the importer in batches from `Plugins -> Development -> AI Task Runner UI Importer`:
   - `1. Generate list states`
   - `2. Generate execution states A`
   - `3. Generate execution states B`
   - `4. Generate tokens and components`

`Generate all states` is still available, but the batch commands are safer in Figma desktop.

## What It Creates

- A full-state mobile UI board for every current React UI branch.
- A design-token and component page with editable colors, buttons, status pills, task rows, StepCard examples, and branch-specific variants.
- Native Figma Frames, Rectangles, Ellipses, and Text layers instead of screenshots or flattened SVG artwork.

## Notes

The Figma MCP write flow hit the Starter-plan tool-call limit in this session, so this plugin is the reliable editable import path. It can be run inside any Figma design file, including the file created for this task:
`https://www.figma.com/design/AXbMtvdPRkuOSw3jU75s5f`

If import still fails, open `Plugins -> Development -> Open Console` in the Figma desktop app and copy the `Import failed: ...` message. Browser DevTools on the Figma web page does not show the local plugin runtime clearly.

The full importer now also creates a red `AI Task Runner Import Error` frame on the canvas if a batch fails. That frame includes the failed stage and the first part of the exception.

There is also a minimal smoke-test plugin at:
`E:\Codex-workespace\Project1\figma-import\figma-native-plugin-smoke\manifest.json`

Run that first if you want to confirm that local plugins can create editable layers in your Figma environment.
