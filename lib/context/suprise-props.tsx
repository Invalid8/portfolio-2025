"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SurpriseUIProps = Record<string, any>;

interface SurpriseUIContextType {
  props: SurpriseUIProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setProp: (key: string, value: any) => void;
  removeProp: (key: string) => void;
  clearProps: () => void;
}

const SurpriseUIContext = createContext<SurpriseUIContextType | undefined>(
  undefined
);

export function SurpriseUIProvider({ children }: { children: ReactNode }) {
  const [props, setProps] = useState<SurpriseUIProps>({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setProp = (key: string, value: any) => {
    setProps((prev) => ({ ...prev, [key]: value }));
  };

  const removeProp = (key: string) => {
    setProps((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const clearProps = () => setProps({});

  return (
    <SurpriseUIContext.Provider
      value={{ props, setProp, removeProp, clearProps }}
    >
      {children}
    </SurpriseUIContext.Provider>
  );
}

export const useSurpriseUI = () => {
  const context = useContext(SurpriseUIContext);
  if (!context)
    throw new Error("useSurpriseUI must be used within a SurpriseUIProvider");
  return context;
};
