export interface TimeControl {
  initial: number; // seconds
  increment: number; // seconds per move (0 for sudden death)
}

export const parseTimeControl = (timeControl: string): TimeControl | null => {
  if (timeControl === 'unlimited') {
    return null;
  }

  const parts = timeControl.split('+');
  if (parts.length !== 2) {
    return null;
  }

  const initial = parseInt(parts[0], 10);
  const increment = parseInt(parts[1], 10);

  if (isNaN(initial) || isNaN(increment) || initial <= 0) {
    return null;
  }

  return { initial, increment };
};

export const getInitialTimeLeft = (
  timeControl: string,
): { white: number; black: number } | null => {
  const parsed = parseTimeControl(timeControl);
  if (!parsed) {
    return null;
  }

  return {
    white: parsed.initial,
    black: parsed.initial,
  };
};