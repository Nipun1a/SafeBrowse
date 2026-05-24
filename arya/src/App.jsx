import React from 'react';
import Navbar from './components/Home/Navbar';
import Hero from './components/Home/Hero';
import Middle from './components/Home/Middle';
import Footer from './components/Home/Footer';
import Scan from './components/Scan_page/Scan';
import Result from './components/Result_page/Result';
import About from './components/About_page/About';
import ExtensionDownload from './components/Extension_page/ExtensionDownload';

const Home = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <Navbar />
    <Hero />
    <Middle />
    <Footer />
  </div>
);

function App() {
  const pathname = window.location.pathname.toLowerCase();

  if (pathname === '/scan') {
    return <Scan />;
  }

  if (pathname === '/result') {
    return <Result />;
  }

  if (pathname === '/about') {
    return <About />;
  }

  if (pathname === '/download-extension') {
    return <ExtensionDownload />;
  }

  return <Home />;
}

export default App;
