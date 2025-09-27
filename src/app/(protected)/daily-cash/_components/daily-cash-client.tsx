"use client";

import { ReactNode } from "react";

interface DailyCashClientProps {
  children: ReactNode;
}

export function DailyCashClient({ children }: DailyCashClientProps) {
  return <>{children}</>;
}
