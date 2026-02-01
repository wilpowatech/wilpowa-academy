'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Course {
  id: string
  title: string
  description: string
  duration_weeks: number
}

interface Enrollment {
  id: string
  course: Course
  start_date: string
  expected_end_date: string
  status: string
}

export default function StudentDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile?.role === 'student') {
      fetchEnrollments()
    }
  }, [user, profile])

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(
          `
          id,
          start_date,
          expected_end_date,
          status,
          course:courses(id, title, description, duration_weeks)
        `
        )
        .eq('student_id', user?.id)

      if (error) throw error
      setEnrollments(data || [])
    } catch (err) {
      console.error('Error fetching enrollments:', err)
    } finally {
      setCoursesLoading(false)
    }
  }

  if (loading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name}</h1>
            <p className="text-gray-400 mt-1">Student Dashboard</p>
          </div>
          <Button onClick={() => router.push('/profile')} variant="outline" className="border-slate-600">
            Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">You haven't enrolled in any courses yet.</p>
            <Link href="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {enrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const [timeRemaining, setTimeRemaining] = useState<{
    weeks: number
    days: number
    hours: number
    minutes: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const endDate = new Date(enrollment.expected_end_date).getTime()
      const difference = endDate - now

      if (difference > 0) {
        const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7))
        const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 7)
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((difference / 1000 / 60) % 60)

        setTimeRemaining({ weeks, days, hours, minutes })
      } else {
        setTimeRemaining({ weeks: 0, days: 0, hours: 0, minutes: 0 })
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000)

    return () => clearInterval(interval)
  }, [enrollment.expected_end_date])

  const course = enrollment.course as Course

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
        <p className="text-gray-400 mb-6">{course.description}</p>

        {/* Countdown Timer */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-400 mb-3">Time Remaining in Course</p>
          {timeRemaining ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{timeRemaining.weeks}</div>
                <p className="text-gray-400 text-sm">Weeks</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{timeRemaining.days}</div>
                <p className="text-gray-400 text-sm">Days</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{timeRemaining.hours}</div>
                <p className="text-gray-400 text-sm">Hours</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{timeRemaining.minutes}</div>
                <p className="text-gray-400 text-sm">Minutes</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Loading...</div>
          )}
        </div>

        {/* Progress and Actions */}
        <div className="flex gap-4">
          <Link href={`/student/course/${enrollment.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Continue Course</Button>
          </Link>
          <Link href={`/student/progress/${enrollment.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-slate-600 bg-transparent">
              View Progress
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
