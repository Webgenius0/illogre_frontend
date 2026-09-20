export const validators = {
  email: (v: string) =>
    !v.trim()
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? "Enter a valid email address"
        : true,
  password: (v: string) =>
    !v
      ? "Password is required"
      : v.length < 8
        ? "Must be at least 8 characters"
        : !/[A-Z]/.test(v)
          ? "Include at least one uppercase letter"
          : !/[0-9]/.test(v)
            ? "Include at least one number"
            : true,
  name: (v: string) =>
    !v.trim()
      ? "Full name is required"
      : v.trim().length < 2
        ? "Name must be at least 2 characters"
        : true,
  company: (v: string) =>
    !v.trim()
      ? "Company name is required"
      : v.trim().length < 2
        ? "Name must be at least 2 characters"
        : true,
  passwordMatch: (p: string, c: string) =>
    !c
      ? "Please confirm your password"
      : p !== c
        ? "Passwords do not match"
        : true,
  terms: (v: boolean) =>
    !v ? "You must agree to the terms and conditions" : true,
  otp: (otp: string[]) =>
    otp.join("").length < 4 ? "Please enter the complete 4-digit code" : true,
};
