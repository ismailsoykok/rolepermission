// App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Login   from "./pages/Login";
import EditUser   from "./pages/EditUser";
import Admin   from "./pages/Admin";
import Manager from "./pages/Manager";
import Worker  from "./pages/Worker";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ------------------------------------------------------------------ */
/*  Yardımcı: LocalStorage’ta token varsa rolü okuyup geri döndür      */
/* ------------------------------------------------------------------ */
const getInitialAuth = () => {
  const token = localStorage.getItem("userToken");
  if (!token) return { token: null, role: null };

  try {
    const { role } = jwtDecode(token);  // backend → { …, role: "admin" }
    return { token, role };
  } catch {
    return { token: null, role: null }; // bozuk token
  }
};

function App() {
  const [{ token, role }, setAuth] = useState(getInitialAuth);

  /* -------------------------------------------------------------- */
  /*  Login’den gelen yeni token’ı kaydet                            */
  /* -------------------------------------------------------------- */
  const setUserToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("userToken", newToken);
      const { role: newRole } = jwtDecode(newToken);
      setAuth({ token: newToken, role: newRole });
    } else {
      localStorage.removeItem("userToken");
      setAuth({ token: null, role: null });
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* KÖK: role’e göre yönlendir */}
          <Route
            path="/"
            element={
              token
                ? role === "admin"
                  ? <Navigate to="/admin" replace />
                  : role === "manager"
                    ? <Navigate to="/manager" replace />
                    : <Navigate to="/worker" replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              token
                ? <Navigate to="/" replace />
                : <Login setUserToken={setUserToken} />
            }
          />

          {/* ADMIN ‑ sadece admin */}
          <Route
            path="/admin"
            element={
              token && role === "admin"
                ? <Admin />
                : token
                  ? role === "manager"
                    ? <Navigate to="/manager" replace />
                    : <Navigate to="/worker" replace />
                  : <Navigate to="/login" replace />
            }
          />

          {/* MANAGER ‑ sadece manager */}
          <Route
            path="/manager"
            element={
              token && role === "manager"
                ? <Manager />
                : token
                  ? role === "admin"
                    ? <Navigate to="/admin" replace />
                    : <Navigate to="/worker" replace />
                  : <Navigate to="/login" replace />
            }
          />

          {/* WORKER ‑ diğer tüm roller */}
          <Route
            path="/worker"
            element={
              token
                ? <Worker />
                : <Navigate to="/login" replace />
            }
          />

          <Route path="/user/edit/:id" element={<EditUser />} />


          {/* 404 ve bilmediğimiz tüm yollar */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
