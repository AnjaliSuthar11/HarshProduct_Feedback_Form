import "./globals.css";

export const metadata = {
  title: "Harsh Products | Customer Feedback Form",
  description: "Harsh Products Customer Feedback Form",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}