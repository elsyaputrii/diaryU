'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, subscribe } from '../store';

/**
 * Status Diary Pribadi.
 *  isLocked(id) -> catatan ini ditandai privat
 *  isHidden(id) -> privat DAN belum dibuka (isinya harus disembunyikan)
 */
export function usePrivacy() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isLocked = useCallback((id: number) => state.locked.includes(id), [state]);
  const isHidden = useCallback(
    (id: number) => state.locked.includes(id) && !state.unlocked.includes(id),
    [state]
  );

  return { hasPin: state.hasPin, isLocked, isHidden };
}
