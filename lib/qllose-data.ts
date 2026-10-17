
 // Centralized Qllose data types and fallback data

export type PlanetId = 'creator' | 'gamer' | 'business'

export interface Planet {
  id: PlanetId
  name: string
  tagline: string
  description: string
  audience: string[]
  channels: string[]
  members: number
  accent: string
  accent2: string
}

// Gaming is the only planet shown in the planet selection page.
// Keep the legacy IDs for compatibility with other existing pages.
export const planets: Planet[] = [
  {
    id: 'gamer',
    name: 'Gaming Planet',
    tagline: 'Where teams, friends and legends meet.',
    description:
      'A universe for gamers to find their squad, join communities, and play together.',
    audience: [
      'Competitive Players',
      'Gaming Communities',
      'Squads',
      'Friends',
    ],
    
channels: [
  // Main
  'Global',
  'Looking for Players',
  'Find a Squad',
  'Gaming News',
  'Game Releases',
  'Clips & Highlights',
  'Tournaments',
  'Esports',
  'Gaming Setup',
  'Tech & Hardware',

  // FPS & Tactical
  'Valorant',
  'Counter-Strike 2',
  'Call of Duty',
  'Call of Duty: Warzone',
  'Rainbow Six Siege',
  'Overwatch 2',
  'Apex Legends',
  'The Finals',
  'Battlefield',
  'Escape from Tarkov',
  'PUBG: Battlegrounds',
  'Delta Force',
  'Marvel Rivals',
  'Destiny 2',
  'Halo Infinite',

  // Battle Royale
  'Fortnite',
  'PUBG Mobile',
  'Free Fire',
  'Call of Duty Mobile',
  'Blood Strike',
  'Fall Guys',

  // MOBA & Strategy
  'League of Legends',
  'Dota 2',
  'Mobile Legends: Bang Bang',
  'Honor of Kings',
  'Wild Rift',
  'Teamfight Tactics',
  'Age of Empires',
  'Civilization VII',
  'Total War',

  // Sandbox & Survival
  'Minecraft',
  'Roblox',
  'Terraria',
  'Rust',
  'ARK: Survival Ascended',
  'Palworld',
  'Valheim',
  'DayZ',
  'Project Zomboid',
  'The Forest',
  'Sons of the Forest',
  '7 Days to Die',
  'Subnautica',

  // RPG & Adventure
  'GTA V',
  'Red Dead Redemption 2',
  'Elden Ring',
  'Elden Ring Nightreign',
  'Dark Souls',
  'Baldur’s Gate 3',
  'Cyberpunk 2077',
  'The Witcher 3',
  'Monster Hunter Wilds',
  'Genshin Impact',
  'Honkai: Star Rail',
  'Wuthering Waves',
  'Final Fantasy XIV',
  'World of Warcraft',
  'Black Myth: Wukong',
  'Hades II',

  // Sports & Racing
  'EA Sports FC',
  'eFootball',
  'NBA 2K',
  'Madden NFL',
  'Rocket League',
  'Forza Horizon',
  'Forza Motorsport',
  'Gran Turismo 7',
  'F1',
  'Need for Speed',
  'Assetto Corsa',
  'The Crew Motorfest',

  // Fighting
  'Tekken 8',
  'Street Fighter 6',
  'Mortal Kombat 1',
  'Super Smash Bros.',
  'Dragon Ball: Sparking! ZERO',

  // Horror & Co-op
  'Phasmophobia',
  'Dead by Daylight',
  'Lethal Company',
  'Content Warning',
  'Left 4 Dead 2',
  'Helldivers 2',
  'Deep Rock Galactic',
  'Ready or Not',
  'It Takes Two',

  // Indie & Casual
  'Among Us',
  'Stardew Valley',
  'The Sims 4',
  'Hollow Knight',
  'Silksong',
  'Cuphead',
  'Undertale',
  'Brawlhalla',
  'Team Fortress 2',
  'VRChat',

  // Platforms & Community
  'Steam',
  'PlayStation',
  'Xbox',
  'Nintendo Switch',
  'Mobile Gaming',
  'PC Gaming',
  'Game Development',
],

    members: 0,
    accent: 'var(--gamer)',
    accent2: 'var(--gamer-2)',
  },
]

export function getPlanet(id: string) {
  return planets.find((planet) => planet.id === id)
}

// =====================
// Messages
// =====================

export interface Message {
  id: string
  user_id?: string
  author: string
  initials: string
  color: string
  time: string
  text: string
  message_type?: 'text' | 'voice' | 'image'
  audio_path?: string | null
  audio_duration?: number | null
  avatar_url?: string | null
  reactions?: {
    emoji: string
    count: number
  }[]
}

export const messagesByPlanet: Record<PlanetId, Message[]> = {
  creator: [],
  gamer: [
    {
      id: 'g1',
      author: 'Kenji Tanaka',
      initials: 'KT',
      color: 'var(--gamer)',
      time: '20:12',
      text: 'Ranked grind tonight? Need one more for a full stack.',
    },
  ],
  business: [],
}

// =====================
// Members
// =====================

export interface Member {
  user_id: string
  name: string
  initials: string
  color: string
  role: string
  online: boolean
  avatar_url?: string | null
}

export const currentUser = {
  username: 'nova',
  displayName: 'Nova Sterling',
  initials: 'NS',
  email: 'nova@qllose.space',
  bio: 'A gamer exploring the edges of the universe.',
  favoritePlanet: 'Gaming Planet',
  joinDate: 'March 2025',
  stats: {
    messages: 1284,
    planets: 1,
    channels: 12,
  },
}

// Temporary export for old imports
export const membersByPlanet: Record<PlanetId, Member[]> = {
  creator: [],
  gamer: [],
  business: [],
}
