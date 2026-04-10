# Chess 42 Design System

This project uses a small reusable UI system shared across the main app, admin panel, profile, lobby and game screens.

## Palette

- Primary action: blue
- Secondary action: neutral gray
- Danger action: red
- Surface: white / dark gray
- Text: primary and secondary variants for light and dark mode

Shared tokens live in `client/src/components/ui/designSystem.ts`.

## Typography

- Heading: semibold titles for page and card headers
- Body: compact readable text for tables, forms and notifications
- Label: consistent form labels and small metadata text

## Reusable components

The reusable component inventory includes:

1. `Button`
2. `Input`
3. `Card`
4. `CardHeader`
5. `CardBody`
6. `Modal`
7. `Avatar`
8. `Badge`
9. `Spinner`
10. `Icon`
11. `ToastProvider`
12. `Navbar`
13. `Layout`
14. `GameHeader`
15. `GameLayout`

## Notes

- The same tokens are reused in admin, profile, lobby and game pages.
- Notifications use the same iconography and visual language as the rest of the UI.
- Game customization keeps the same design language in both 2D and 3D views.
