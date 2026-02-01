import { Signup } from '@/components/auth/signup'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - DevCourse Platform',
  description: 'Create a new course account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Signup />
    </div>
  )
}
