export const VALIDATION_RULES = {
  name: {
    min: 1,
    max: 50,
    pattern: /^[a-zA-Z\s\-']+$/,
    message: {
      required: 'Name is required',
      tooShort: 'Name must be at least 1 character',
      tooLong: 'Name cannot exceed 50 characters',
      invalid: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  bio: {
    min: 0,
    max: 500,
    message: {
      tooLong: 'Bio cannot exceed 500 characters'
    }
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    max: 255,
    message: {
      required: 'Email is required',
      invalid: 'Please enter a valid email address',
      tooLong: 'Email cannot exceed 255 characters'
    }
  }
}

export interface ValidationError {
  field: string
  message: string
}

export const validateName = (name: string, fieldName: string): ValidationError | null => {
  const rules = VALIDATION_RULES.name

  if (!name || name.trim().length === 0) {
    return { field: fieldName, message: rules.message.required }
  }

  if (name.length < rules.min) {
    return { field: fieldName, message: rules.message.tooShort }
  }

  if (name.length > rules.max) {
    return { field: fieldName, message: rules.message.tooLong }
  }

  if (!rules.pattern.test(name)) {
    return { field: fieldName, message: rules.message.invalid }
  }

  return null
}

export const validateBio = (bio: string): ValidationError | null => {
  if (bio.length > 10000) {
    return {
      field: 'bio',
      message: 'Bio must be less than 10,000 characters'
    }
  }
  return null
}

export const validateEmail = (email: string): ValidationError | null => {
  const rules = VALIDATION_RULES.email

  if (!email || email.trim().length === 0) {
    return { field: 'email', message: rules.message.required }
  }

  if (email.length > rules.max) {
    return { field: 'email', message: rules.message.tooLong }
  }

  if (!rules.pattern.test(email)) {
    return { field: 'email', message: rules.message.invalid }
  }

  return null
} 