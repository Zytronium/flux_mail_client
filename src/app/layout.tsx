import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TitleBar from "@/components/TitleBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluxMail",
  description: "Futuristic email client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
    >
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30 animate-gradient"
             style={{
               background: 'linear-gradient(45deg, rgba(0,242,255,0.03), rgba(188,19,254,0.03), rgba(0,242,255,0.03))',
               backgroundSize: '400% 400%',
             }}
        />

        {/* Subtle grid background effect */}
        <div className="absolute inset-0 opacity-[0.02]"
             style={{
               backgroundImage: 'linear-gradient(#00f2ff 1px, transparent 1px), linear-gradient(90deg, #00f2ff 1px, transparent 1px)',
               backgroundSize: '50px 50px'
             }}
        />

        {/* Animated scanlines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none animate-scanline"
             style={{
               backgroundImage: 'linear-gradient(transparent 50%, rgba(0,242,255,0.5) 50%)',
               backgroundSize: '100% 4px',
             }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-neon-blue/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative h-full w-full">
          {children}
        </div>
      </div>
    </div>
    </body>
    </html>
  );
}
