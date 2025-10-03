import { createFileRoute } from '@tanstack/react-router'
import { EventTrackingTestPage } from '../pages/EventTrackingTestPage'

export const Route = createFileRoute('/event-tracking-test')({
  component: EventTrackingTestPage,
})
