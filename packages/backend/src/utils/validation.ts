export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 letter, and 1 number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  return passwordRegex.test(password)
} 