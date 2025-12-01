
import EditEventPage from '@/app/pages/editEventPage/EditEventPage'
import React from 'react'

export default function page({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  return (
    <div>
      <EditEventPage params={params} />
    </div>
  )
}
