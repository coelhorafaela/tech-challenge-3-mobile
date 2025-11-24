export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: 'Nome é obrigatório' };
  }

  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, message: 'Nome não pode estar vazio' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (trimmed.length > 80) {
    return { isValid: false, message: 'Nome muito longo (máximo 80 caracteres)' };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email é obrigatório' };
  }

  if (!email.trim()) {
    return { isValid: false, message: 'Email não pode estar vazio' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email inválido' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Senha é obrigatória' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Senha muito longa (máximo 128 caracteres)' };
  }

  // Verificar se tem pelo menos uma letra
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Senha deve conter pelo menos uma letra' };
  }

  return { isValid: true };
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Confirmação de senha é obrigatória' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Senhas não coincidem' };
  }

  return { isValid: true };
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
};

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    return confirmPasswordValidation;
  }

  return { isValid: true };
};
