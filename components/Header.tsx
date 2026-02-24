// @ts-nocheck
import React from 'react';

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="text-xl font-bold">TaskFlow</div>
        <nav>
          <a className="text-sm text-gray-600 hover:text-gray-900 mr-4" href="#">
            Projects
          </a>
          <a className="text-sm text-gray-600 hover:text-gray-900" href="#">
            Profile
          </a>
        </nav>
      </div>
    </header>
  );
}
