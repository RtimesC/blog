import styled from 'styled-components';

/**
 * A small, self-contained loading indicator adapted from the supplied Uiverse
 * component. The animation is decorative; the status text remains available
 * to assistive technology.
 */
export function TappingHandLoader({ label = 'Loading' }) {
  return (
    <StyledWrapper role="status" aria-label={label}>
      <div className="hand" aria-hidden="true">
        <div className="finger" />
        <div className="finger" />
        <div className="finger" />
        <div className="finger" />
        <div className="palm" />
        <div className="thumb" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  --skin-color: #e4c560;
  --tap-speed: 0.6s;
  --tap-stagger: 0.1s;

  display: inline-block;
  width: 160px;
  height: 96px;

  .hand {
    position: relative;
    width: 80px;
    height: 60px;
    margin: 0 auto;
  }

  .hand::before {
    position: absolute;
    top: 70%;
    right: 20%;
    display: block;
    width: 180%;
    height: 75%;
    border-radius: 40px 10px;
    background: #000;
    content: '';
    filter: blur(10px);
    opacity: 0.3;
  }

  .palm {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 10px 40px;
    background: var(--skin-color);
  }

  .thumb {
    position: absolute;
    right: 1%;
    bottom: -18%;
    width: 120%;
    height: 38px;
    border-bottom: 2px solid rgb(0 0 0 / 10%);
    border-left: 2px solid rgb(0 0 0 / 10%);
    border-radius: 30px 20px 20px 10px;
    background: var(--skin-color);
    transform: rotate(-20deg);
    transform-origin: calc(100% - 20px) 20px;
  }

  .thumb::after {
    position: absolute;
    bottom: -8%;
    left: 5px;
    width: 20%;
    height: 60%;
    border-right: 2px solid rgb(0 0 0 / 5%);
    border-radius: 60% 10% 10% 30%;
    background: rgb(255 255 255 / 30%);
    content: '';
  }

  .finger {
    position: absolute;
    right: 64%;
    bottom: 32%;
    width: 80%;
    height: 35px;
    border-radius: 20px;
    background: var(--skin-color);
    transform: rotate(10deg);
    transform-origin: 100% 20px;
    animation-duration: calc(var(--tap-speed) * 2);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  .finger::before {
    position: absolute;
    right: 65%;
    bottom: 8%;
    width: 140%;
    height: 30px;
    border-radius: 20px;
    background: var(--skin-color);
    content: '';
    transform: rotate(-60deg);
    transform-origin: calc(100% - 20px) 20px;
  }

  .finger:nth-child(1) {
    animation-name: tap-upper-1;
    animation-delay: 0s;
    filter: brightness(70%);
  }

  .finger:nth-child(2) {
    animation-name: tap-upper-2;
    animation-delay: var(--tap-stagger);
    filter: brightness(80%);
  }

  .finger:nth-child(3) {
    animation-name: tap-upper-3;
    animation-delay: calc(var(--tap-stagger) * 2);
    filter: brightness(90%);
  }

  .finger:nth-child(4) {
    animation-name: tap-upper-4;
    animation-delay: calc(var(--tap-stagger) * 3);
    filter: brightness(100%);
  }

  @keyframes tap-upper-1 {
    0%, 50%, 100% { transform: rotate(10deg) scale(0.4); }
    40% { transform: rotate(50deg) scale(0.4); }
  }

  @keyframes tap-upper-2 {
    0%, 50%, 100% { transform: rotate(10deg) scale(0.6); }
    40% { transform: rotate(50deg) scale(0.6); }
  }

  @keyframes tap-upper-3 {
    0%, 50%, 100% { transform: rotate(10deg) scale(0.8); }
    40% { transform: rotate(50deg) scale(0.8); }
  }

  @keyframes tap-upper-4 {
    0%, 50%, 100% { transform: rotate(10deg) scale(1); }
    40% { transform: rotate(50deg) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .finger { animation: none; }
  }
`;

export default TappingHandLoader;
