import "./App.css";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Admin from "./Pages/Admin";
import Product from "./Pages/Product";
import Invoice from "./Pages/Invoice";
import UpdateUser from "./Pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Product />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<UpdateUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;