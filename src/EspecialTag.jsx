import React from 'react';
import './EspecialTag.css';

const EspecialTag = () => {
  return (
    <div className="especial-tag" aria-hidden="false">
      <span className="especial-tag__icon">
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path d="M12 2.5l2.7 5.5 6 .9-4.4 4.3 1 5.8L12 15.3l-5.3 2.8 1-5.8-4.4-4.3 6-.9L12 2.5z" fill="url(#starGradient)" />
        </svg>
      </span>
      <span className="especial-tag__label">Especial</span>
    </div>
  );
};

export default EspecialTag;
