import * as NavigationMenu from '@radix-ui/react-navigation-menu';

const sectionLinks = [
  { href: '#notes', label: 'Field notes' },
  { href: '#projects', label: 'Selected work' },
  { href: '#about', label: 'About' }
];

export default function BlogNavigation() {
  return (
    <NavigationMenu.Root className="blog-navigation" aria-label="Blog sections">
      <NavigationMenu.List className="blog-navigation__list">
        {sectionLinks.map(({ href, label }) => (
          <NavigationMenu.Item key={href}>
            <NavigationMenu.Link asChild>
              <a className="blog-navigation__link" href={href}>{label}</a>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="blog-navigation__trigger">
            Explore <span aria-hidden="true">↗</span>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="blog-navigation__content">
            <ul className="blog-navigation__explore-list">
              <li>
                <NavigationMenu.Link asChild>
                  <a className="blog-navigation__explore-link" href="#notes">
                    <span>01</span>
                    <strong>Field notes</strong>
                    <small>Short system observations</small>
                  </a>
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link asChild>
                  <a className="blog-navigation__explore-link" href="#projects">
                    <span>02</span>
                    <strong>Selected work</strong>
                    <small>Projects and evidence</small>
                  </a>
                </NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <div className="blog-navigation__viewport-position">
        <NavigationMenu.Viewport className="blog-navigation__viewport" />
      </div>
    </NavigationMenu.Root>
  );
}
