# AI Task Runner Figma Import

This folder contains a Figma-native importer for the current React UI.

## Primary Artifact

- `figma-native-plugin/manifest.json`
- `figma-native-plugin/code.js`
- `figma-native-plugin-smoke/manifest.json` is a minimal environment test if the full importer fails.
- `figma-native-plugin-list/manifest.json` is a standalone safer importer for the five task-list states.

Run the local Figma plugin batch commands to generate editable Figma frames for every UI state in the current frontend.

## Generated Pages

The plugin creates two Figma pages:

- `AI Task Runner - All UI States`
  - Task list empty state
  - Active task list
  - Completed task list expanded
  - Long-press action sheet
  - Delete confirmation dialog
  - Execution idle, loading, ready, executing, paused, exited, completed
  - Clarification, completion confirmation, closing checklist, resistance, resolving, and inline error states
- `Design Tokens + Components`
  - Color tokens from `client/src/App.css`
  - Buttons, status pills, task list rows, StepCard patterns, action-sheet variants, and branch-specific completion buttons

All output is made from native Figma Frames, Rectangles, Ellipses, and Text layers, so it remains editable.

## Source UI

- `client/src/App.jsx`
- `client/src/StepCard.jsx`
- `client/src/App.css`

## Legacy SVG

- `ai-task-runner-ui.svg` is an older one-screen SVG reference. Prefer the native plugin for the current full-state design.
