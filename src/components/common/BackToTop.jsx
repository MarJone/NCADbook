import { useState, useEffect } from 'react';

export default function BackToTop({ threshold = 300 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="back-to-top"
      aria-label="Scroll to top"
      data-testid="back-to-top-btn"
    >
      <span aria-hidden="true">↑</span>
      <span className="back-to-top-text">Back to Top</span>
    </button>
  );
}
