import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} <strong>Talent Bridge</strong> · Bringing opportunities to your doorstep
    </footer>
  );
};

export default Footer;
