// src/App.js
import React from 'react';
import HomePage from '../src/pages/home'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<HomePage />} />  
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
         <Route path="/dashboard" element={<Dashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
