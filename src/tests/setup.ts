import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLElement.prototype.scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock THREE.js WebGLRenderer
vi.mock('three', async () => {
  const actual = await vi.importActual('three') as any;
  class MockWebGLRenderer {
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    getPixelRatio = vi.fn().mockReturnValue(1);
    setClearColor = vi.fn();
    getSize = vi.fn().mockReturnValue({ width: 100, height: 100 });
    getDrawingBufferSize = vi.fn().mockReturnValue({ width: 100, height: 100 });
    render = vi.fn();
    dispose = vi.fn();
    compile = vi.fn();
    domElement = document.createElement('canvas');
    shadowMap = { enabled: false };
    capabilities = { getMaxAnisotropy: () => 1 };
  }
  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});

// Mock gsaps
vi.mock('gsap', () => {
    return {
        default: {
            to: vi.fn(),
            fromTo: vi.fn(),
            killTweensOf: vi.fn()
        }
    }
});
