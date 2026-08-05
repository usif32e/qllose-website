// Centralized Qllose data types and fallback data


export type PlanetId =
  | 'creator'
  | 'gamer'
  | 'business'



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




export const planets: Planet[] = [

  {
    id:'creator',

    name:'Creator Planet',

    tagline:'For the people who build the future.',

    description:
    'A universe for developers, designers, editors and artists shipping their craft every day.',

    audience:[
      'Developers',
      'Designers',
      'Editors',
      'Artists',
      'Creators'
    ],

    channels:[

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
      'Freelancing'

    ],

    members:0,

    accent:'var(--creator)',

    accent2:'var(--creator-2)',
  },



  {
    id:'gamer',

    name:'Gamer Planet',

    tagline:
    'Where teams, friends and legends meet.',


    description:
    'Competitive players and gaming communities finding their squad across every title.',


    audience:[
      'Competitive players',
      'Gaming communities',
      'Teams',
      'Friends'
    ],


    channels:[

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
      'Apex Legends'

    ],


    members:0,


    accent:'var(--gamer)',

    accent2:'var(--gamer-2)',

  },




  {
    id:'business',

    name:'Business Planet',

    tagline:
    'Founders, freelancers and people building companies.',


    description:
    'Entrepreneurs, founders and professionals trading ideas, deals and momentum.',


    audience:[

      'Entrepreneurs',
      'Founders',
      'Freelancers',
      'Professionals'

    ],


    channels:[

      'Global',
      'Startups',
      'Shopify',
      'Marketing',
      'Sales',
      'Branding',
      'Finance',
      'Investing',
      'SaaS',
      'Networking'

    ],


    members:0,


    accent:'var(--business)',

    accent2:'var(--business-2)',

  }


]





export function getPlanet(
  id:string
){

  return planets.find(
    p=>p.id===id
  )

}






export interface Message {

  id:string

  author:string

  initials:string

  color:string

  time:string

  text:string

  avatar_url?:string|null

  reactions?:{
    emoji:string
    count:number
  }[]

}







// Members are loaded from Supabase

export interface Member {

  user_id?:string

  name:string

  initials:string

  color:string

  role:string

  online:boolean

  avatar_url?:string|null

}








export const messagesByPlanet:
Record<PlanetId,Message[]> = {


creator:[

{

id:'c1',

author:'Maya Reyes',

initials:'MR',

color:'var(--creator)',

time:'09:41',

text:
'Just shipped the new design system tokens.',

}

],




gamer:[

{

id:'g1',

author:'Kenji Tanaka',

initials:'KT',

color:'var(--gamer)',

time:'20:12',

text:
'Ranked grind tonight? Need one more for a full stack.',

}

],




business:[

{

id:'b1',

author:'Priya Nair',

initials:'PN',

color:'var(--business)',

time:'11:02',

text:
'Closed our first paying customers this week.',

}

]


}







export const currentUser = {

username:'nova',

displayName:'Nova Sterling',

initials:'NS',

email:'nova@qllose.space',

bio:
'Product designer exploring the edges of the universe.',

favoritePlanet:'Creator Planet',

joinDate:'March 2025',


stats:{

messages:1284,

planets:3,

channels:12

}


}






// Temporary export for old imports
export const membersByPlanet = {

  creator:[],

  gamer:[],

  business:[]

}