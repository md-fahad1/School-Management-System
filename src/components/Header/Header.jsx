"use client";

import HeaderContent from "./HeaderContent";
// import Navbar from "./Navbar";

const Header = () => {
  return (
    <>
      {/* <div className="flex justify-center bg-dash-primary">
        <HeaderContact />
      </div> */}
      <header className="sticky top-0 z-50 ">
        <HeaderContent />
        {/* <Navbar /> */}
      </header>
    </>
  );
};

export default Header;
