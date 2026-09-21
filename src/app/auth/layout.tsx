import { ReactNode } from "react";
import logo from "../../assets/Logo.svg";
import Image from "next/image";
import Link from "next/link";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-secondary/20 to-primary/40">
      <Link href="/" className="fixed top-6 left-6 z-50 cursor-pointer">
        <Image src={logo} alt="logo" className="w-28" />
      </Link>
      {children}
    </div>
  );
}
