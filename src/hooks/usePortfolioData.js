import { galleryProjects } from '../content/portfolio';

// The portfolio is intentionally local and version controlled. This small
// module keeps the original components decoupled from the content file without
// introducing a CMS or a network request.
export const portfolioData = {
  projects: galleryProjects,
  loaded: true,
};

export function loadPortfolioData() {
  return Promise.resolve(portfolioData);
}

export function isPortfolioDataLoaded() {
  return true;
}

export function useGalleryProjects() {
  return galleryProjects;
}
