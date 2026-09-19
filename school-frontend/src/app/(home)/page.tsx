import Hero from "@/components/Hero/Hero";
import ContactPage from "./contact/page";
import CoursePage from "./courses/page";
import EventPage from "./events/page";
import BlogPage from "./blog/page";

const Homepage = () => {
  return (
    <>
      <Hero />
      <CoursePage />
      <EventPage />
      <BlogPage />
      <ContactPage />
    </>
  );
};

export default Homepage;