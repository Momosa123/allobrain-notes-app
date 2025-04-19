import '@testing-library/jest-dom';

// Mock ResizeObserver
// Create a simple class with the expected methods that does nothing.
class ResizeObserverMock {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

// Assign the mock to the global window object.
window.ResizeObserver = ResizeObserverMock;

// Optional but often helpful: Mock matchMedia as well
// Some components use it for CSS media queries in JS
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
