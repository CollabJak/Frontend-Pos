/**
 * Remember-me localStorage helpers.
 *
 * Stores the remembered email (NEVER password) so the login form can pre-fill
 * the email field on the next visit. The flag `pos:remember_me_enabled` tracks
 * whether the user opted in, so the checkbox state survives reloads.
 *
 * SECURITY: Only non-sensitive data (email) is persisted. The remember-me
 * cookie itself is set by the backend (HttpOnly + Secure). This helper is
 * purely a UX convenience.
 */

const STORAGE_KEY_EMAIL = "pos:remembered_email";
const STORAGE_KEY_FLAG = "pos:remember_me_enabled";

function safeGet(key: string): string | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, value);
  } catch {
    // ignore (e.g. private mode quota exceeded)
  }
}

function safeRemove(key: string): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const rememberMe = {
  /** Returns the remembered email, or null if none. */
  getRememberedEmail(): string | null {
    return safeGet(STORAGE_KEY_EMAIL);
  },

  /** Persists the email so the login form can pre-fill it next visit. */
  setRememberedEmail(email: string): void {
    const trimmed = email.trim();
    if (trimmed) {
      safeSet(STORAGE_KEY_EMAIL, trimmed);
    }
  },

  /** Removes the persisted email. */
  clearRememberedEmail(): void {
    safeRemove(STORAGE_KEY_EMAIL);
  },

  /** Returns true if the user previously opted into remember-me. */
  isEnabled(): boolean {
    return safeGet(STORAGE_KEY_FLAG) === "1";
  },

  /** Persists the remember-me opt-in flag (used to restore checkbox state). */
  setEnabled(enabled: boolean): void {
    if (enabled) {
      safeSet(STORAGE_KEY_FLAG, "1");
    } else {
      safeRemove(STORAGE_KEY_FLAG);
    }
  },

  /** Removes both email and flag — used on explicit opt-out. */
  clearAll(): void {
    safeRemove(STORAGE_KEY_EMAIL);
    safeRemove(STORAGE_KEY_FLAG);
  },
};