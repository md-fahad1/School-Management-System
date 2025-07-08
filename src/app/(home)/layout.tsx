import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ContactPage from "./contact/page";
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <ContactPage />
      </body>{" "}
      {/* ✅ wrap children inside <body> */}
    </html>
  );
}
