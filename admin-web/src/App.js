import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './Admin/AdminLoginForm/Login';
import VerifyOtp from './Admin/AdminLoginForm/VerifyOtp';

import AdminRoutes from './Routes/AdminRoutes';

function App() {
 return (
   <Router>
      <Routes>


        {/* 🔐 Admin routes without layout */}
        <Route path="/admin/login" element={<LoginForm />} />
         <Route path="/admin/verify-otp" element={<VerifyOtp />} />
        {/* <Route path="/admin/not-authorized" element={<LoginForm />} />
        <Route path="/admin/verify-otp" element={<VerifyOtp />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} /> */}

        {/* All Admin routes with layout */}
        <Route path="/admin/*" element={<AdminRoutes />} />

      

        {/* 🌍 Global 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
