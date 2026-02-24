// @ts-nocheck
import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-6xl mx-auto p-4 text-sm text-gray-500">© {new Date().getFullYear()} TaskFlow</div>
    </footer>
  );
}
