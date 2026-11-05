import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/opportunities/$opportunitiesId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/opportunities/$opportunitiesId/"!</div>
}
