import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Error tracking for uncaught errors
window.addEventListener('error', (event) => {
  if (event.error === null) {
    console.warn('Global error: Script error (details hidden by browser security policy)', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno
    });
  } else {
    console.error('Global error:', event.error);
  }
  // In production, you would send this to your error tracking service
});

// Performance monitoring
if ('PerformanceObserver' in window) {
  try {
    // Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`Performance metric: ${entry.name}`, entry);
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (e) {
    console.error('Performance monitoring error:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);