import Hero from "@/components/Hero/Hero";
import Footer from "@/components/Footer/Footer";
import ContactPage from "./contact/page";
import CoursePage from "./courses/page";
import EventPage from "./events/page";
import BlogPage from "./blog/page";

const Homepage = () => {
  return (
    <div className="">
      <Hero />
      <CoursePage />
      <EventPage />
      <BlogPage />
    </div>
  );
};

export default Homepage;
