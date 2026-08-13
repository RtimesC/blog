import { useScene } from '../../context/SceneContext';
import { useGalleryProjects } from '../../hooks/usePortfolioData';
import { fieldNotes } from '../../content/portfolio';
import { aboutMilestones } from '../../content/portfolio';
import '../../styles/ScreenReaderOverlay.scss';

/**
 * ScreenReaderOverlay — A7 Accessibility
 * 
 * Invisible HTML layer providing screen reader access to 3D canvas content.
 * Contains buttons/links matching interactive 3D elements (doors, rooms).
 * Visually hidden via .sr-only but fully accessible to assistive tech.
 */
const ScreenReaderOverlay = () => {
    const { hasEntered, isInRoom, currentRoom, teleportTo, requestExit } = useScene();
    
    // Pobieranie danych do wygenerowania niewidocznego HTML-a dla SEO / robotów
    const projects = useGalleryProjects();
    const studio = fieldNotes;

    return (
        <div className="sr-overlay" role="complementary" aria-label="Accessible navigation for 3D portfolio">
            {/* Skip to content link */}
            <a href="#sr-main-nav" className="sr-only sr-focusable">
                Skip to accessible navigation
            </a>

            {/* Main accessible navigation */}
            <nav id="sr-main-nav" className="sr-only" aria-label="Portfolio rooms">
                <h1>Tao — Embodied AI and Mechatronics</h1>
                <h2>Portfolio Navigation</h2>

                {!hasEntered && (
                    <p>Welcome to Tao's interactive 3D portfolio. Use a door to enter the corridor, or use the reading entry to open the selected work directly.</p>
                )}

                {hasEntered && !isInRoom && (
                    <>
                        <p>You are in the corridor. Choose a room to explore:</p>
                        <ul>
                            <li>
                                <button onClick={() => teleportTo('about')} type="button">
                                    About — My story, skills, and journey
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('gallery')} type="button">
                                    Selected Work — robotics and embedded systems projects
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('contact')} type="button">
                                    GitHub — source and field notes
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('studio')} type="button">
                                    The Studio — Technologies and experience
                                </button>
                            </li>
                        </ul>
                    </>
                )}

                {hasEntered && isInRoom && (
                    <>
                        <p>
                            You are in the {currentRoom === 'about' ? 'About' :
                                currentRoom === 'gallery' ? 'Gallery' :
                                        currentRoom === 'contact' ? 'GitHub' :
                                        currentRoom === 'studio' ? 'Studio' : currentRoom} room.
                        </p>
                        <button onClick={requestExit} type="button">
                            Go back to corridor
                        </button>

                        {/* Room-specific content descriptions */}
                        {currentRoom === 'about' && (
                            <div aria-label="About room content">
                                <h3>{aboutMilestones.intro.title} — {aboutMilestones.intro.label}</h3>
                                <p>{aboutMilestones.intro.statement}. Scroll through the sky to see the system boundaries, field path, and tools in motion.</p>
                                <section>
                                    <h4>{aboutMilestones.systems.title}</h4>
                                    <ul>{aboutMilestones.systems.items.map((item) => <li key={item.title}>{item.title}: {item.text}</li>)}</ul>
                                </section>
                                <section>
                                    <h4>{aboutMilestones.path.title}</h4>
                                    <ul>{aboutMilestones.path.items.map((item) => <li key={item.title}>{item.title}: {item.text}</li>)}</ul>
                                </section>
                            </div>
                        )}
                        {currentRoom === 'gallery' && (
                            <div aria-label="Gallery room content">
                                <h3>Selected Work</h3>
                                <p>Browse robotics and embedded systems projects displayed on paper cards. Open the notes side of a card for a readable project page and its GitHub source.</p>
                                
                                {projects && projects.length > 0 && (
                                    <ul>
                                        {projects.map((p, i) => (
                                            <li key={i}>
                                                <h4>{p.title}</h4>
                                                <p>{p.description}</p>
                                                {p.url && <a href={p.url}>View {p.title} on GitHub</a>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {currentRoom === 'contact' && (
                            <div aria-label="Contact room content">
                                <h3>GitHub / RtimesC</h3>
                                <p>A single floating signal buoy links to the project source and field notes. There is no contact form or social-media directory.</p>
                                <a href="https://github.com/RtimesC">Open RtimesC on GitHub</a>
                            </div>
                        )}
                        {currentRoom === 'studio' && (
                            <div aria-label="Studio room content">
                                <h3>Field Notes</h3>
                                <p>Rotate the monitor tower to browse concise notes on robot runtime, simulation validation, and embedded interfaces. Each note leads to the related readable project page.</p>

                                {studio && studio.length > 0 && (
                                    <ul>
                                        {studio.map((s, i) => (
                                            <li key={i}>
                                                <h4>{s.title}</h4>
                                                <p>{s.description}</p>
                                                {s.workSlug && <a href={`?work=${s.workSlug}`}>Read project notes</a>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Quick navigation to other rooms */}
                        <h3>Quick Navigation</h3>
                        <ul>
                            {currentRoom !== 'about' && (
                                <li><button onClick={() => teleportTo('about')} type="button">Go to About</button></li>
                            )}
                            {currentRoom !== 'gallery' && (
                                <li><button onClick={() => teleportTo('gallery')} type="button">Go to Gallery</button></li>
                            )}
                            {currentRoom !== 'contact' && (
                                <li><button onClick={() => teleportTo('contact')} type="button">Go to Contact</button></li>
                            )}
                            {currentRoom !== 'studio' && (
                                <li><button onClick={() => teleportTo('studio')} type="button">Go to Studio</button></li>
                            )}
                        </ul>
                    </>
                )}
            </nav>

            {/* Live region for state changes */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {isInRoom && `Entered ${currentRoom} room`}
            </div>
        </div>
    );
};

export default ScreenReaderOverlay;
