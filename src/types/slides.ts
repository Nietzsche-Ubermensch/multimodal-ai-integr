import { ReactNode } from "react";

export interface SlideData {
  id: string;
  title: string;
  subtitle?: string;
  content?: ReactNode;
  code?: string;
  bullets?: string[];
}
