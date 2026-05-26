import { createContext, useContext } from 'react';

type TemplateCtx = {
  get: (key: string, fallback?: string) => string;
  set: (key: string, val: string) => void;
};

export const TemplateDataCtx = createContext<TemplateCtx>({
  get: (_, fb = '') => fb,
  set: () => {},
});

export function useTemplateCtx() {
  return useContext(TemplateDataCtx);
}
