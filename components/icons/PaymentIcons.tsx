import React from 'react';

export const CashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const QRIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5 6.5v.01M4 4h1.5v1.5H4V4zm2.5 0h1.5v1.5H6.5V4zM4 6.5h1.5V8H4V6.5zm2.5 1.5h1.5V8H6.5V8zm-2.5 2.5H4V12h1.5v-1.5zM11 4h1.5v1.5H11V4zm2.5 0h1.5v1.5H13.5V4zm-2.5 2.5h1.5V8H11V6.5zm2.5 0h1.5V8h-1.5V6.5zm-2.5 2.5h1.5v1.5H11V9zm2.5 0h1.5v1.5h-1.5V9zM6.5 4h1.5v1.5H6.5V4zM4 9h1.5v1.5H4V9zm9.5 7.5a2.5 2.5 0 01-5 0V14a2.5 2.5 0 015 0v2.5z" />
  </svg>
);
