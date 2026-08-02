// Centralized mock data for the Qllose MVP frontend.
// This is intentionally the ONLY place that holds domain data so it can be
// swapped for real API calls later without touching the UI components.

export type PlanetId = 'creator' | 'gamer' | 'business'

export interface Planet {
  id: PlanetId
  name: string
  tagline: string
  description: string
  audience: string[]
  channels: string[]
  members: number
  // token names defined in globals.css
  accent: string
  accent2: string
}

export const planets: Planet[] = [
  {
    id: 'creator',
    name: 'Creator Planet',
    tagline: 'For the people who build the future.',
    description:
      'A universe for developers, designers, editors and artists shipping their craft every day.',
    audience: ['Developers', 'Designers', 'Editors', 'Artists', 'Creators', 'Builders'],
    channels: [
      'Global',
      'Web Development',
      'Frontend',
      'Backend',
      'Mobile Development',
      'UI / UX',
      'Graphic Design',
      'Motion Design',
      'Video Editing',
      'Photography',
      '3D',
      'Artificial Intelligence',
      'Open Source',
      'Content Creation',
      'Freelancing',
    ],
    members: 48210,
    accent: 'var(--creator)',
    accent2: 'var(--creator-2)',
  },
  {
    id: 'gamer',
    name: 'Gamer Planet',
    tagline: 'Where teams, friends and legends meet.',
    description:
      'Competitive players and gaming communities finding their squad across every title.',
    audience: ['Competitive players', 'Gaming communities', 'Teams', 'Friends'],
    channels: [
      'Global',
      'Valorant',
      'Counter Strike',
      'League of Legends',
      'Minecraft',
      'PUBG',
      'Fortnite',
      'EA Sports FC',
      'Grand Theft Auto',
      'Call of Duty',
      'Rocket League',
      'Apex Legends',
    ],
    members: 72904,
    accent: 'var(--gamer)',
    accent2: 'var(--gamer-2)',
  },
  {
    id: 'business',
    name: 'Business Planet',
    tagline: 'Founders, freelancers and the people building companies.',
    description:
      'Entrepreneurs, founders and professionals trading ideas, deals and momentum.',
    audience: ['Entrepreneurs', 'Founders', 'Freelancers', 'Shopify', 'Professionals'],
    channels: [
      'Global',
      'Startups',
      'Shopify',
      'Marketing',
      'Sales',
      'Branding',
      'Finance',
      'Investing',
      'SaaS',
      'Product Management',
      'Freelancing',
      'Networking',
    ],
    members: 31567,
    accent: 'var(--business)',
    accent2: 'var(--business-2)',
  },
]

export function getPlanet(id: string): Planet | undefined {
  return planets.find((p) => p.id === id)
}

export interface Message {
  id: string
  author: string
  initials: string
  color: string
  time: string
  text: string
  avatar_url?: string | null
  reactions?: { emoji: string; count: number }[]
}

export interface Member {
  name: string
  initials: string
  color: string
  role: string
  online: boolean
}

// Realistic sample conversations keyed by planet id.
export const messagesByPlanet: Record<PlanetId, Message[]> = {
  creator: [
    {
      id: 'c1',
      author: 'Maya Reyes',
      initials: 'MR',
      color: 'var(--creator)',
      time: '09:41',
      text: 'Just shipped the new design system tokens. Everything is on a 4px grid now, feels so much cleaner.',
      reactions: [
        { emoji: '🔥', count: 12 },
        { emoji: '🎉', count: 5 },
      ],
    },
    {
      id: 'c2',
      author: 'Daniel Okafor',
      initials: 'DO',
      color: 'var(--creator-2)',
      time: '09:43',
      text: 'Love that. Are you handling dark mode with CSS variables or a separate theme file?',
    },
    {
      id: 'c3',
      author: 'Maya Reyes',
      initials: 'MR',
      color: 'var(--creator)',
      time: '09:44',
      text: 'CSS variables. One source of truth, way less to maintain.',
      reactions: [{ emoji: '💯', count: 8 }],
    },
    {
      id: 'c4',
      author: 'Sofia Lindqvist',
      initials: 'SL',
      color: 'var(--primary)',
      time: '09:52',
      text: 'Anyone here doing motion work in After Effects? Looking for feedback on a logo reveal.',
    },
  ],
  gamer: [
    {
      id: 'g1',
      author: 'Kenji Tanaka',
      initials: 'KT',
      color: 'var(--gamer)',
      time: '20:12',
      text: 'Ranked grind tonight? Need one more for a full stack in Valorant.',
      reactions: [{ emoji: '🎮', count: 9 }],
    },
    {
      id: 'g2',
      author: 'Aisha Kone',
      initials: 'AK',
      color: 'var(--gamer-2)',
      time: '20:14',
      text: "I'm in. Diamond 2, mostly play controller agents.",
    },
    {
      id: 'g3',
      author: 'Lucas Moreau',
      initials: 'LM',
      color: 'var(--primary)',
      time: '20:15',
      text: 'Same, lock me in. GLHF everyone.',
      reactions: [
        { emoji: '🚀', count: 6 },
        { emoji: '🏆', count: 3 },
      ],
    },
  ],
  business: [
    {
      id: 'b1',
      author: 'Priya Nair',
      initials: 'PN',
      color: 'var(--business)',
      time: '11:02',
      text: 'Closed our first 10 paying customers this week. Cold outreach + a tight demo is still unbeaten.',
      reactions: [
        { emoji: '🚀', count: 21 },
        { emoji: '👏', count: 14 },
      ],
    },
    {
      id: 'b2',
      author: 'Marcus Bell',
      initials: 'MB',
      color: 'var(--business-2)',
      time: '11:05',
      text: 'Congrats! What was your average sales cycle length?',
    },
    {
      id: 'b3',
      author: 'Priya Nair',
      initials: 'PN',
      color: 'var(--business)',
      time: '11:07',
      text: 'About 9 days. Keeping it short by qualifying hard on the first call.',
      reactions: [{ emoji: '💡', count: 7 }],
    },
  ],
}

export const membersByPlanet: Record<PlanetId, Member[]> = {
  creator: [
    { name: 'Maya Reyes', initials: 'MR', color: 'var(--creator)', role: 'Design Lead', online: true },
    { name: 'Daniel Okafor', initials: 'DO', color: 'var(--creator-2)', role: 'Full-stack', online: true },
    { name: 'Sofia Lindqvist', initials: 'SL', color: 'var(--primary)', role: 'Motion', online: true },
    { name: 'Noah Kim', initials: 'NK', color: 'var(--gamer)', role: 'Frontend', online: false },
    { name: 'Elena Rossi', initials: 'ER', color: 'var(--business)', role: '3D Artist', online: false },
  ],
  gamer: [
    { name: 'Kenji Tanaka', initials: 'KT', color: 'var(--gamer)', role: 'IGL', online: true },
    { name: 'Aisha Kone', initials: 'AK', color: 'var(--gamer-2)', role: 'Controller', online: true },
    { name: 'Lucas Moreau', initials: 'LM', color: 'var(--primary)', role: 'Duelist', online: true },
    { name: 'Ivan Petrov', initials: 'IP', color: 'var(--creator)', role: 'Support', online: false },
  ],
  business: [
    { name: 'Priya Nair', initials: 'PN', color: 'var(--business)', role: 'Founder', online: true },
    { name: 'Marcus Bell', initials: 'MB', color: 'var(--business-2)', role: 'Growth', online: true },
    { name: 'Hannah Cole', initials: 'HC', color: 'var(--primary)', role: 'Investor', online: false },
    { name: 'Omar Haddad', initials: 'OH', color: 'var(--gamer)', role: 'Freelancer', online: false },
  ],
}

// The signed-in user (mocked). Replace with session data later.
export const currentUser = {
  username: 'nova',
  displayName: 'Nova Sterling',
  initials: 'NS',
  email: 'nova@qllose.space',
  bio: 'Product designer exploring the edges of the universe. Building calm, focused interfaces.',
  favoritePlanet: 'Creator Planet',
  joinDate: 'March 2025',
  stats: {
    messages: 1284,
    planets: 3,
    channels: 12,
  },
}
