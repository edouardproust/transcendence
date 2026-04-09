export const AUTH_CONSTRAINTS = {
  email: {
    pattern: /\S+@\S+\.\S+/,
  },
  username: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?\\|[\]~`]).*$/,
    minLength: 12,
    maxLength: 128,
  },
} as const;

export const validateUsername = (value: string): string | null => {
  const normalized = value.trim();

  if (!normalized) {
    return 'El nombre de usuario es obligatorio.';
  }
  if (normalized.length < AUTH_CONSTRAINTS.username.minLength) {
    return `El nombre de usuario debe tener al menos ${AUTH_CONSTRAINTS.username.minLength} caracteres.`;
  }
  if (normalized.length > AUTH_CONSTRAINTS.username.maxLength) {
    return `El nombre de usuario no puede superar ${AUTH_CONSTRAINTS.username.maxLength} caracteres.`;
  }
  if (!AUTH_CONSTRAINTS.username.pattern.test(normalized)) {
    return 'Solo se permiten letras, números, guiones y guion bajo.';
  }

  return null;
};

export const validateEmail = (value: string): string | null => {
  const normalized = value.trim();

  if (!normalized) {
    return 'El email es obligatorio.';
  }
  if (!AUTH_CONSTRAINTS.email.pattern.test(normalized)) {
    return 'Ingresa un email válido.';
  }

  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) {
    return 'La contraseña es obligatoria.';
  }
  if (value.length < AUTH_CONSTRAINTS.password.minLength) {
    return `La contraseña debe tener al menos ${AUTH_CONSTRAINTS.password.minLength} caracteres.`;
  }
  if (value.length > AUTH_CONSTRAINTS.password.maxLength) {
    return `La contraseña no puede superar ${AUTH_CONSTRAINTS.password.maxLength} caracteres.`;
  }
  if (!AUTH_CONSTRAINTS.password.pattern.test(value)) {
    return 'La contraseña debe incluir mayúscula, minúscula, número y carácter especial.';
  }

  return null;
};
