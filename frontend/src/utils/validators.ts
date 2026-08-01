export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string) {
  return password.length >= 6;
}

export function validateStudentId(id: string) {
  return /^STU-\d{3,}$/.test(id);
}

export function validateRoomNumber(room: string) {
  return /^[A-Z]-\d{3}$/.test(room);
}

export function validateScore(score: number) {
  return score >= 0 && score <= 100;
}

export function validateRequired(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

export function validateMinLength(value: string, min: number) {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number) {
  return value.length <= max;
}
