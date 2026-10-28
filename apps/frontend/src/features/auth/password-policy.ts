const PASSWORD_MIN_LENGTH = 12
const PASSWORD_POLICY_MESSAGE = 'Use at least 12 characters with uppercase, lowercase, a number, and a symbol.'

function passwordMeetsPolicy(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH
    && /\p{Ll}/u.test(password)
    && /\p{Lu}/u.test(password)
    && /\p{N}/u.test(password)
    && /[\p{Z}\p{S}\p{P}]/u.test(password)
}

export { PASSWORD_MIN_LENGTH, PASSWORD_POLICY_MESSAGE, passwordMeetsPolicy }
