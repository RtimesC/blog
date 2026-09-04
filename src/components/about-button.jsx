import styled from 'styled-components';

const StyledWrapper = styled.div`
  width: 100%;

  a {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.7rem;
    overflow: hidden;
    border-radius: 5px;
    background: #183153;
    box-shadow: 0 6px 24px rgb(0 0 0 / 20%);
    color: #fff;
    font-family: "Inter", sans-serif;
    text-decoration: none;
  }

  a::after {
    position: absolute;
    inset-block: 0;
    right: 0;
    width: 0;
    background: #ffd401;
    content: "";
    transition: width 400ms ease-in-out;
  }

  a:hover::after,
  a:focus-visible::after {
    right: auto;
    left: 0;
    width: 100%;
  }

  a:focus-visible {
    outline: 3px solid #ffd401;
    outline-offset: 3px;
  }

  span {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 0.78rem 0.8rem;
    color: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    line-height: 1;
    text-align: center;
    text-transform: uppercase;
    transition: color 300ms ease-in-out;
  }

  a:hover span,
  a:focus-visible span {
    color: #183153;
    animation: about-scale-up 300ms ease-in-out;
  }

  @keyframes about-scale-up {
    0%, 100% {
      transform: scale(1);
    }

    50% {
      transform: scale(0.95);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a::after,
    span {
      transition-duration: 1ms;
    }

    a:hover span,
    a:focus-visible span {
      animation: none;
    }
  }
`;

function AboutButton() {
  return (
    <StyledWrapper className="taotao-home-about-slot">
      <a aria-label="About me" href="/about">
        <span>About</span>
      </a>
    </StyledWrapper>
  );
}

export { AboutButton };
