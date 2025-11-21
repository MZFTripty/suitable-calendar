import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center p-5 gap-10 animate-fade-in ">
        <h1 className='mt-3 font-bold text-3xl text-purple-700'>Suitable Calendar</h1>
      <Image src="/assets/logo1.png" alt="Logo Image" width={100} height={100} className='rounded-xl'/>
      <div className='mt-3'>
        <SignIn />
      </div>
    </main>
  )
}
