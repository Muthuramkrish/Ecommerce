// import React from "react";
// import { Navigate } from "react-router-dom";

// /**
//  * AdminRoute (UI-Only Version)
//  * -------------------------------------
//  * Protects admin pages using localStorage data.
//  * No API calls, no backend verification.
//  * Redirects to /login if not logged in,
//  * or to / if not an admin.
//  */
// const AdminRoute = ({ children }) => {
//   // Get current user from localStorage
//   const userData = localStorage.getItem("currentUser");
//   let user = null;

//   try {
//     user = userData ? JSON.parse(userData) : null;
//   } catch {
//     localStorage.removeItem("currentUser");
//   }

//   // If not logged in → go to login
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // If not admin → go to homepage
//   if (user.role !== "admin") {
//     return <Navigate to="/" replace />;
//   }

//   // If admin → render the protected route
//   return children;
// };

// export default AdminRoute;
