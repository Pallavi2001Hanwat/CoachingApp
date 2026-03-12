import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Sidenav.css';

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Typography,
  Collapse
} from '@mui/material';

import {
  Dashboard,
  People,
  School,
  MenuBook,
  ViewModule,
  SubdirectoryArrowRight,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';

const Sidenav = ({ closeSidenav }) => {

  const navigate = useNavigate();

  // Collapse states
  const [courseOpen, setCourseOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/admin/login');
  };

  return (

    <div className="sidebar">

      {/* Logo */}

      <div className="logo">

        <img
          src="https://cdn.worldvectorlogo.com/logos/akasol-1.svg"
          alt="Logo"
          height="45"
        />

      </div>

      <div className="sidenav-list">

        <List component="nav">

          {/* Dashboard */}

          <ListItemButton
            component={Link}
            to="/admin/dashboard"
            onClick={closeSidenav}
            className="sidenav-button"
          >

            <ListItemIcon className="sidenav-icon">
              <Dashboard />
            </ListItemIcon>

            <ListItemText primary="Dashboard" />

          </ListItemButton>


          {/* Users */}

          <ListItemButton
            component={Link}
            to="/admin/Users"
            onClick={closeSidenav}
            className="sidenav-button"
          >

            <ListItemIcon className="sidenav-icon">
              <People />
            </ListItemIcon>

            <ListItemText primary="Users" />

          </ListItemButton>


          {/* COURSE MANAGEMENT */}

          <ListItemButton
            className="sidenav-button"
            onClick={() => setCourseOpen(!courseOpen)}
          >

            <ListItemIcon className="sidenav-icon">
              <School />
            </ListItemIcon>

            <ListItemText primary="Course Management" />

            {courseOpen ? <ExpandLess /> : <ExpandMore />}

          </ListItemButton>

          <Collapse in={courseOpen} timeout="auto" unmountOnExit>

            <List component="div" disablePadding>

              <ListItemButton
                component={Link}
                to="/admin/Category"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="Category" />

              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/admin/Courses"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="Courses" />

              </ListItemButton>

            </List>

          </Collapse>


          {/* SUBJECT MANAGEMENT */}

          <ListItemButton
            className="sidenav-button"
            onClick={() => setSubjectOpen(!subjectOpen)}
          >

            <ListItemIcon className="sidenav-icon">
              <MenuBook />
            </ListItemIcon>

            <ListItemText primary="Subject Management" />

            {subjectOpen ? <ExpandLess /> : <ExpandMore />}

          </ListItemButton>

          <Collapse in={subjectOpen} timeout="auto" unmountOnExit>

            <List component="div" disablePadding>

              <ListItemButton
                component={Link}
                to="/admin/Subjects"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="Subjects" />

              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/admin/Chapters"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="Chapters" />

              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/admin/Topics"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="Topics" />

              </ListItemButton>

            </List>

          </Collapse>


          {/* DASHBOARD CONTENT */}

          <ListItemButton
            className="sidenav-button"
            onClick={() => setDashboardOpen(!dashboardOpen)}
          >

            <ListItemIcon className="sidenav-icon">
              <ViewModule />
            </ListItemIcon>

            <ListItemText primary="Dashboard Content" />

            {dashboardOpen ? <ExpandLess /> : <ExpandMore />}

          </ListItemButton>

          <Collapse in={dashboardOpen} timeout="auto" unmountOnExit>

            <List component="div" disablePadding>

              <ListItemButton
                component={Link}
                to="/admin/DashboardItems"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="Dashboard Items" />

              </ListItemButton>

            </List>

          </Collapse>


          {/* PREVIOUS YEAR PAPERS */}

          <ListItemButton
            className="sidenav-button"
            onClick={() => setPaperOpen(!paperOpen)}
          >

            <ListItemIcon className="sidenav-icon">
              <ViewModule />
            </ListItemIcon>

            <ListItemText primary="Previous Year Papers" />

            {paperOpen ? <ExpandLess /> : <ExpandMore />}

          </ListItemButton>

          <Collapse in={paperOpen} timeout="auto" unmountOnExit>

            <List component="div" disablePadding>

              <ListItemButton
                component={Link}
                to="/admin/PreviousYearPaperCategorys"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="PreviousYearPaperCategory" />

              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/admin/PreviousYearPapers"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="PreviousYearPapers" />

              </ListItemButton>

            </List>

          </Collapse>


          {/* TEST MANAGEMENT */}

          <ListItemButton
            className="sidenav-button"
            onClick={() => setTestOpen(!testOpen)}
          >

            <ListItemIcon className="sidenav-icon">
              <ViewModule />
            </ListItemIcon>

            <ListItemText primary="Test Management" />

            {testOpen ? <ExpandLess /> : <ExpandMore />}

          </ListItemButton>

          <Collapse in={testOpen} timeout="auto" unmountOnExit>

            <List component="div" disablePadding>

              <ListItemButton
                component={Link}
                to="/admin/TestSeries"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="TestSeries" />

              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/admin/TestPapers"
                onClick={closeSidenav}
                className="sidenav-button sidenav-subbutton"
              >

                <ListItemIcon className="sidenav-icon">
                  <SubdirectoryArrowRight />
                </ListItemIcon>

                <ListItemText primary="TestPapers" />

              </ListItemButton>

            </List>

          </Collapse>

        </List>


        {/* Logout */}

        <Box className="logout-box">

          <Typography className="login-user">
            Logged in as <strong>User Name</strong>
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </Button>

        </Box>

      </div>

    </div>

  );

};

export default Sidenav;