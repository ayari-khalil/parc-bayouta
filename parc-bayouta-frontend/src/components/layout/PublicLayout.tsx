import { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "../Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
