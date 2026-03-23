// Validate Email Function
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Fixed regex syntax
  return regex.test(email);
};

// Validate Password - minimum 6 characters, at least one uppercase, one lowercase, one number
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true, message: "" };
};

export const getInitials = (name) => {
  if (!name) return "";

  const words = name.trim().split(" "); 
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};
