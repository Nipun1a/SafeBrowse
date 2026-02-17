import React from 'react';
import Navbar from './components/Home/Navbar';
import Hero from './components/Home/Hero';
import Middle from './components/Home/Middle';
import Footer from './components/Home/Footer';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <Middle />
      <Footer />
    </div>
  );
}

export default App;
