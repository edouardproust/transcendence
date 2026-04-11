export const uiPalette = {
  surface: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  surfaceMuted: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700',
  textPrimary: 'text-gray-900 dark:text-gray-100',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
  primaryAction: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white',
  secondaryAction:
    'bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white',
  dangerAction: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white',
} as const;

export const uiTypography = {
  heading: 'font-semibold',
  body: 'text-sm',
  label: 'text-sm font-medium',
} as const;

export const uiRadius = {
  md: 'rounded-lg',
  xl: 'rounded-xl',
} as const;

export const uiShadow = {
  card: 'shadow',
  modal: 'shadow-xl',
  toast: 'shadow-lg',
} as const;

export const designSystemInventory = [
  'Button',
  'Input',
  'Card',
  'CardHeader',
  'CardBody',
  'Modal',
  'Avatar',
  'Badge',
  'Spinner',
  'Icon',
  'ToastProvider',
  'Navbar',
  'Layout',
  'GameHeader',
  'GameLayout',
] as const;
