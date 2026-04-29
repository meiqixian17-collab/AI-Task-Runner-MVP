# AI Task Runner Figma Import

This folder contains a Figma-importable SVG rebuilt from the current React UI.

## Files

- `ai-task-runner-ui.svg` - Desktop screen mockup at `1440x900`, with editable vector shapes and text.

## Source UI

- `client/src/App.jsx`
- `client/src/StepCard.jsx`
- `client/src/App.css`

## Main Layout

- Header with app name, title, subtitle, and status pill.
- Three-column workspace:
  - Task input panel
  - Current action priority card
  - Progress panel
- State component examples:
  - Status pills
  - Resistance panel
  - Timeline item pattern

## Design Tokens

- Primary: `#2563EB`
- Primary hover: `#1D4ED8`
- Secondary: `#0F766E`
- Background: `#F6F8FB`
- Card: `#FFFFFF`
- Text: `#111827`
- Secondary text: `#64748B`
- Border: `#E2E8F0`
- Hover background: `#EFF6FF`
- Success background: `#ECFDF5`
- Warning background: `#FFFBEB`
- Card radius: `8px`
- Control radius: `8px`

## Notes

The current Figma connector available in this session does not expose the `use_figma` write API needed to create native Figma frames directly. The SVG is the practical import artifact for this session.
