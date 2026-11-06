'use client';

import { useCallback, useEffect, useState } from 'react';

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

/** Batasi percobaan PIN: 5 kali salah -> tunggu 30 detik. */
export function usePinAttempts() {
  const [failures, setFailures] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const registerFailure = useCallback(() => {
    setFailures((f) => {
      const next = f + 1;
      if (next >= MAX_ATTEMPTS) {
        setCooldown(COOLDOWN_SECONDS);
        return 0;
      }
      return next;
    });
  }, []);

  const registerSuccess = useCallback(() => setFailures(0), []);

  return { cooldown, remaining: MAX_ATTEMPTS - failures, registerFailure, registerSuccess };
}
