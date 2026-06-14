import { JourneyData } from '../components/profile/JourneyCard'
import { Journey } from '../services/post/types'

export const mapJourneyToJourneyData = (journey: Journey): JourneyData => ({
  id: journey.id,
  title: journey.title,
  description: journey.description || '',
  date: journey.createdAt
    ? new Date(journey.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Today',
  steps: (journey as any).stepsCount || 0,
  status: 'Active',
  image: undefined,
})

export const mapJourneysToJourneyData = (journeys: Journey[]): JourneyData[] =>
  journeys.map(mapJourneyToJourneyData)
