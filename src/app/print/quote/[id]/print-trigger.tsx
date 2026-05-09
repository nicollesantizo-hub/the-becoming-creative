"use client";

import { useEffect } from "react";

export function PrintTrigger({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
    window.print();
  }, [title]);

  return null;
}
