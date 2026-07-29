import { notFound } from 'next/navigation'
import { getPlanet, messagesByPlanet, membersByPlanet, planets } from '@/lib/qllose-data'
import { PlanetClient } from '@/components/qllose/planet-client'

export function generateStaticParams() {
  return planets.map((p) => ({ id: p.id }))
}

export default async function PlanetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const planet = getPlanet(id)

  if (!planet) notFound()

  return (
    <PlanetClient
      planet={planet}
      baseMessages={messagesByPlanet[planet.id]}
      members={membersByPlanet[planet.id]}
    />
  )
}
