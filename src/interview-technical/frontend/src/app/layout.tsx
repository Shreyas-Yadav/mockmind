import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Technical",
  description: "Multimodal technical interviewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{
          margin: 0,
          fontFamily: "Calibri, 'Segoe UI', sans-serif",
          backgroundColor: "#201c25",
          color: "#e5e5e5",
        }}
      >
        {children}
      </body>
    </html>
  );
}
