import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parent Dashboard — Gojo-sensei Chat Monitor",
  description: "Review your child's chat logs with the Gojo-sensei AI companion",
};

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
