import BookingPage from '@/app/pages/bookingPage/BookingPage'
import React from 'react'

export default async function page({params}: {params: Promise<{clerkUserId: string, eventId: string}>}) {
    
  return (
    <div>
      <BookingPage params={params}/>
    </div>
  )
}
