import Leaf1 from '../assets/LeafParticle_1.webp';
import Leaf2 from '../assets/LeafParticle_2.webp';

const LEAVES = [Leaf1, Leaf2];
const COUNT = 7;
const DURATION_MS = 700;

export function useParticles() {
  function burst(x: number, y: number) {
    for (let i = 0; i < COUNT; i++) {
      const img = document.createElement('img');
      img.src = LEAVES[Math.floor(Math.random() * LEAVES.length)]!;

      const angle = Math.random() * 360;
      const dist  = 40 + Math.random() * 60;
      const size  = 16 + Math.random() * 20;
      const spin  = (Math.random() - 0.5) * 540;

      img.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
        z-index: 9999;
        transform-origin: center;
        animation: leafBurst ${DURATION_MS}ms ease-out forwards;
        --angle: ${angle}deg;
        --dist: ${dist}px;
        --spin: ${spin}deg;
      `;

      document.body.appendChild(img);
      img.addEventListener('animationend', () => img.remove(), { once: true });
    }
  }

  return { burst };
}
