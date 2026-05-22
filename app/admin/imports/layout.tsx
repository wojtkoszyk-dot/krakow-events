import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import queue — kraków.events",
  description: "Review imported event candidates before publishing.",
};

export default function AdminImportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
