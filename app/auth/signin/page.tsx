'use client'

import React from 'react'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Sign In</h1>
      <form className="mt-8 space-y-6">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Sign In
        </button>
      </form>
    </div>
  )
} 