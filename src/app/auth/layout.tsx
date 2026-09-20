import { ReactNode } from "react";
import logo from "../../assets/Logo.svg";
import Image from "next/image";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-secondary/20 to-primary/40">
      <Image src={logo} alt="logo" className="fixed top-6 left-6 w-28" />
      {children}
    </div>
  );
}
