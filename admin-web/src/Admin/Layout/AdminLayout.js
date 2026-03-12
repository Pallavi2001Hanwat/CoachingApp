import React, { useState, useEffect } from 'react';
import Sidenav from '../AdminComponents/Sidenav';
import '../AdminStyle/AdminGlobalStyle.css';
import Navbar from '../AdminComponents/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AdminLayout = ({ children }) => {
  const [isSidenavVisible, setIsSidenavVisible] = useState(false); // Sidebar starts hidden for mobile/tablet
  const [isDesktopView, setIsDesktopView] = useState(true);

  const toggleSidenav = () => {
    setIsSidenavVisible((prev) => !prev); // Toggle sidenav visibility
  };

  const closeSidenav = () => {
    setIsSidenavVisible(false);
  };
  useEffect(() => {
    const handleResize = () => {
      
      const isDesktop = window.innerWidth >= 1200; // Breakpoint for desktop
      setIsDesktopView(isDesktop);
      if (isDesktop) {
        setIsSidenavVisible(true); // Ensure sidenav is visible on desktop
      } else {
        setIsSidenavVisible(false); // Hide sidenav in tablet and mobile by default
      }
    };

    handleResize(); // Check initial window size
    window.addEventListener('resize', handleResize); // Update on resize
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="body">
      <div className="wrapper" id="wrapper">
        {/* Sidenav */}
        <div
          className={`sidenav-container ${isSidenavVisible ? 'visible' : ''}`}
        >
          <Sidenav closeSidenav={closeSidenav}/>
        </div>

        {/* Main Content */}
        <div className="main-Content">
          <Navbar toggleSidenav={toggleSidenav} />
          {children}
        </div>
      </div>

      {/* Overlay for tablet and mobile view */}
      {!isDesktopView && isSidenavVisible && (
        <div
          className="sidenav-overlay"
          onClick={() => setIsSidenavVisible(false)}
        ></div>
      )}
       <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminLayout;
