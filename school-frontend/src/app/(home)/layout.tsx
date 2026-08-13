import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ContactPage from "./contact/page";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <ContactPage />
    </>
  );
}
