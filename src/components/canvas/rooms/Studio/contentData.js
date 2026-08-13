import { fieldNotes, works } from '../../../../content/portfolio';

// Studio keeps the original monitor-tower interaction, but its cards are now
// local technical notes instead of a social-media feed.
export const PLATFORM_CONFIG = {
    fieldnote: {
        color: '#d8ece6',
        accentColor: '#0b8073',
        icon: '⌁',
        label: 'Field note',
        shape: 'monitor',
    },
};

export const CONTENT_DATA = fieldNotes.map((note) => {
    const work = works.find((item) => item.slug === note.workSlug);

    return {
        ...note,
        platform: 'fieldnote',
        device: 'monitor',
        url: work?.repoUrl || 'https://github.com/RtimesC',
        workSlug: work?.slug || note.workSlug,
        platformConfig: PLATFORM_CONFIG.fieldnote,
    };
});

export const getContentByPlatform = (platform) => (
    platform === 'all' ? CONTENT_DATA : CONTENT_DATA.filter((item) => item.platform === platform)
);

export const getLatestContent = () => CONTENT_DATA[0];
