/**
 * Centralized validation helpers — single source of truth for every
 * client-side validation rule used across forms.  Each `validate*` function
 * returns `{ valid: boolean, errors: Record<string, string> }`.
 *
 * These are intentionally lightweight and server-agnostic; the backend is
 * always the authority for security-critical validation (password strength,
 * uniqueness, etc.).  These exist to give users immediate feedback before
 * they submit.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_RE = /^[A-Za-z][A-Za-z\s'.-]*$/;
// E.164-like: + followed by 1-15 digits
export const PHONE_RE = /^\+[1-9]\d{6,14}$/;

/** Strip characters that shouldn't appear in a name. */
export function sanitizeName(value) {
  return value.replace(/[^A-Za-z\s'.-]/g, '');
}

/** Strip characters that aren't digits or the leading '+'. */
export function sanitizePhone(value) {
  let v = value.replace(/[^0-9+]/g, '');
  return v.replace(/(?!^)\+/g, '');
}

/* ── Individual rules ───────────────────────────────────────────────── */

export function required(value, fieldName) {
  if (typeof value === 'string' && !value.trim()) {
    return `${fieldName} is required.`;
  }
  if (value === null || value === undefined) {
    return `${fieldName} is required.`;
  }
  return null;
}

export function minLength(value, min, fieldName) {
  if (typeof value === 'string' && value.length > 0 && value.length < min) {
    return `${fieldName} must be at least ${min} characters.`;
  }
  return null;
}

export function maxLength(value, max, fieldName) {
  if (typeof value === 'string' && value.length > max) {
    return `${fieldName} must be no more than ${max} characters.`;
  }
  return null;
}

export function emailFormat(value) {
  if (typeof value === 'string' && value && !EMAIL_RE.test(value.trim())) {
    return 'Enter a valid email address.';
  }
  return null;
}

export function nameFormat(value) {
  if (typeof value === 'string' && value && !NAME_RE.test(value.trim())) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
  }
  return null;
}

export function phoneFormat(value) {
  if (typeof value === 'string' && value && !PHONE_RE.test(value.trim())) {
    return 'Enter a valid phone number with country code (e.g. +15550000000).';
  }
  return null;
}

export function matches(otherValue, fieldName) {
  return (value) => {
    if (value !== otherValue) {
      return `${fieldName} do not match.`;
    }
    return null;
  };
}

/* ── Compose rules ──────────────────────────────────────────────────── */

/**
 * Run an array of validation rule results (null = valid, string = error)
 * and return the first error for each field.
 *
 * Usage:
 *   const { valid, errors } = validateFields({
 *     email: [required(email, 'Email'), emailFormat(email)],
 *     password: [required(password, 'Password'), minLength(password, 8, 'Password')],
 *   });
 */
export function validateFields(fieldRules) {
  const errors = {};
  for (const [field, rules] of Object.entries(fieldRules)) {
    for (const err of rules) {
      if (err) {
        errors[field] = err;
        break;
      }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

/* ── Pre-built form validators ──────────────────────────────────────── */

export function validateContactForm(data) {
  return validateFields({
    name: [required(data.name, 'Full name'), nameFormat(data.name)],
    email: [required(data.email, 'Email'), emailFormat(data.email)],
    phone: [phoneFormat(data.phone)],
    message: [required(data.message, 'Message')],
  });
}

export function validateLoginForm(data) {
  return validateFields({
    email: [required(data.email, 'Email'), emailFormat(data.email)],
    password: [required(data.password, 'Password')],
  });
}

export function validateRegisterForm(data) {
  return validateFields({
    name: [required(data.name, 'Full name'), nameFormat(data.name)],
    email: [required(data.email, 'Email'), emailFormat(data.email)],
    password: [
      required(data.password, 'Password'),
      minLength(data.password, 8, 'Password'),
    ],
    confirm: [
      required(data.confirm, 'Confirm password'),
      (v) => (v !== data.password ? 'Passwords do not match.' : null),
    ],
  });
}

export function validateResetPasswordForm(data) {
  return validateFields({
    password: [
      required(data.password, 'Password'),
      minLength(data.password, 8, 'Password'),
    ],
    confirm: [
      required(data.confirm, 'Confirm password'),
      (v) => (v !== data.password ? 'Passwords do not match.' : null),
    ],
  });
}

export function validateTicketForm(data) {
  return validateFields({
    subject: [required(data.subject, 'Subject')],
  });
}

export function validateLeaveForm(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return validateFields({
    type: [required(data.type, 'Leave type')],
    from: [
      required(data.from, 'Start date'),
      data.from && new Date(data.from) < today ? 'Start date cannot be in the past.' : null,
    ],
    to: [
      required(data.to, 'End date'),
      data.from && data.to && new Date(data.to) < new Date(data.from)
        ? 'End date cannot be before start date.'
        : null,
    ],
    reason: [
      required(data.reason, 'Reason'),
      minLength(data.reason, 10, 'Reason'),
    ],
  });
}

export function validateTimesheetForm(data) {
  const now = new Date();
  return validateFields({
    date: [
      required(data.date, 'Date'),
      data.date && new Date(data.date) > now ? 'Date cannot be in the future.' : null,
    ],
    hours: [
      required(data.hours, 'Hours'),
      data.hours && (isNaN(Number(data.hours)) || Number(data.hours) <= 0)
        ? 'Hours must be a positive number.'
        : null,
      data.hours && Number(data.hours) > 24 ? 'Cannot log more than 24 hours per entry.' : null,
    ],
  });
}
