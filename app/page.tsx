'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user, loading, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (profile?.role === 'instructor') {
        router.push('/instructor/dashboard')
      } else if (profile?.role === 'student') {
        router.push('/student/dashboard')
      } else {
        router.push('/admin/dashboard')
      }
    }
  }, [user, loading, profile, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">DevCourse</h1>
          <div className="flex gap-4">
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-slate-600 text-gray-300 hover:text-white bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">Professional Software Development Bootcamp</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Master full-stack development in 12 weeks with real-world projects, hands-on labs, and expert instruction.
        </p>

        {!user ? (
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup?role=student">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Enroll as Student
              </Button>
            </Link>
            <Link href="/auth/signup?role=instructor">
              <Button size="lg" variant="outline" className="border-slate-600 text-gray-300 hover:text-white bg-transparent">
                Become an Instructor
              </Button>
            </Link>
          </div>
        ) : null}
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: '12-Week Intensive',
              description: 'Complete curriculum with time-based progress tracking',
              href: user ? (profile?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard') : '/auth/signup?role=student',
            },
            {
              title: 'Real-World Projects',
              description: 'Build portfolio-ready applications and labs',
              href: user ? (profile?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard') : '/auth/signup?role=student',
            },
            {
              title: 'Expert Assessment',
              description: '4 comprehensive exams + plagiarism detection',
              href: user ? (profile?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard') : '/auth/signup?role=student',
            },
            {
              title: 'Live Mentoring',
              description: 'Direct access to experienced instructors',
              href: user ? (profile?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard') : '/auth/signup?role=instructor',
            },
            {
              title: 'Certificates',
              description: 'Earn verified completion certificates',
              href: user ? (profile?.role === 'student' ? '/student/certificates' : '/instructor/dashboard') : '/auth/signup?role=student',
            },
            {
              title: 'Career Support',
              description: 'Job placement assistance and resume review',
              href: user ? (profile?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard') : '/auth/signup?role=student',
            },
          ].map((feature, i) => (
            <Link key={i} href={feature.href} className="group">
              <div className="h-full bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                <div className="mt-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                  Learn more →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
