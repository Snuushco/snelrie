'use client';

import { createContext, useContext } from 'react';
import type { ABVariant } from './ab-variants';

export const ABContext = createContext<ABVariant>('a');

export function useABVariant(): ABVariant {
  return useContext(ABContext);
}
