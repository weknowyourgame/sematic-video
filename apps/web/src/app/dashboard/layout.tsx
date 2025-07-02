import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Video Processing",
  description: "Upload and process your videos with AI",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 