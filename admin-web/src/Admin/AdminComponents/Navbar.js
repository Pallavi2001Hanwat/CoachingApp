import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import SettingsIcon from '@mui/icons-material/Settings';
import Person2Icon from '@mui/icons-material/Person2';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Cookies from 'js-cookie';
import {  useNavigate } from 'react-router-dom';


const Navbar = ({ toggleSidenav }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null); // Reference for profile dropdown
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/login');
  };

  // Detect outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <div className="col-md-0 menu-button">
        <button className="menu-toggle" onClick={toggleSidenav}>☰</button>
      </div>

      {/* Search Box */}
      <div className="search-container col-md-8">
        <input type="text" placeholder="Search…" className="search-input" />
      </div>

      {/* Icons Section */}
      <div className="icons-container col-md-3">
        <MailOutlineIcon style={{ marginRight: '8px' }} />

        {/* Profile icon with menu */}
        <div className="profile-container" ref={profileRef}>
          <button className="icon-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen
              ? <KeyboardArrowUpIcon style={{ marginRight: '8px' }} />
              : <KeyboardArrowDownIcon style={{ marginRight: '8px' }} />}
          </button>

          {isMobileMenuOpen && (
            <div className="Profile-menu">
              <div><Person2Icon style={{ marginRight: '8px' }} /> Edit Profile</div>
              <div><SettingsIcon style={{ marginRight: '8px' }} /> Account Settings</div>
              <div><InfoIcon style={{ marginRight: '8px' }} /> Support</div>
              <hr />
             
              <div>
              <a onClick={handleLogout}> <LogoutIcon style={{ marginRight: '8px' }} /> Logout</a></div>
               
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
