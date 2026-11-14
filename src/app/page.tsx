import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

export const metadata: Metadata = {
  alternates: { languages: { en: "/", am: "/am" } },
};

export default function Home() {
  return <HomePage lang="en" />;
}
