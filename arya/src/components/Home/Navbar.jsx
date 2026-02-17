import React from 'react';
import logo from '../../assets/Selection.png';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <img src={logo} alt="SafeBrowse logo" className="h-8 w-8 rounded-sm object-cover" />
          <h1 className="text-lg font-semibold tracking-wide">SafeBrowse</h1>
        </div>
        <div className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            <li className="cursor-pointer transition-colors hover:text-blue-400">Home</li>
            <li className="cursor-pointer transition-colors hover:text-blue-400">Scanner</li>
            <li className="cursor-pointer transition-colors hover:text-blue-400">History</li>
            <li className="cursor-pointer transition-colors hover:text-blue-400">About</li>
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-blue-500/60 px-4 py-2 text-sm font-medium text-white transition-all hover:border-blue-400 hover:text-blue-300">
            Login
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500">
            Register
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
