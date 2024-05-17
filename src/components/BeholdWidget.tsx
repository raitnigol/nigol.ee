import { useEffect } from 'react';

const BeholdWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://w.behold.so/widget.js';
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div data-behold-id="3x6yLpBwvqfwMzEaMvCz"></div>;
};

export default BeholdWidget;
