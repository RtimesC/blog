import * as NavigationMenu from '@radix-ui/react-navigation-menu';

const sectionLinks = [
  { href: '#selected-record', label: 'Record' },
  { href: '#notes', label: 'Note' },
  { href: '#archive', label: 'Archive' }
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
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
