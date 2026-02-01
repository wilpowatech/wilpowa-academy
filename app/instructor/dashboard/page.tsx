'use client'

import React from "react"

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
  total_modules: number
  created_at: string
}

export default function InstructorDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    total_modules: 12,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    if (!loading && profile?.role !== 'instructor') {
      router.push('/')
    }
  }, [user, loading, profile, router])

  useEffect(() => {
    if (user && profile?.role === 'instructor') {
      fetchCourses()
    }
  }, [user, profile])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setCoursesLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          instructor_id: user?.id,
          title: newCourse.title,
          description: newCourse.description,
          total_modules: newCourse.total_modules,
          start_date: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      setCourses([...courses, data[0]])
      setNewCourse({ title: '', description: '', total_modules: 12 })
      setShowCreateCourse(false)
    } catch (err) {
      console.error('Error creating course:', err)
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
            <h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome, {profile?.full_name}</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowCreateCourse(!showCreateCourse)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Course
            </Button>
            <Button onClick={() => router.push('/profile')} variant="outline" className="border-slate-600">
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showCreateCourse && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (weeks)</label>
                <input
                  type="number"
                  value={newCourse.total_modules}
                  onChange={(e) => setNewCourse({ ...newCourse, total_modules: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Create Course
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 bg-transparent"
                  onClick={() => setShowCreateCourse(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-400">No courses created yet. Create your first course to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const router = useRouter()

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition">
      <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
      <p className="text-gray-400 mb-4 line-clamp-2">{course.description}</p>
      <div className="flex gap-2 text-sm text-gray-400 mb-6">
        <span>📚 {course.total_modules} weeks</span>
        <span>📖 {course.total_modules} modules</span>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => router.push(`/instructor/course/${course.id}`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Manage Content
        </Button>
        <Button onClick={() => router.push(`/instructor/analytics/${course.id}`)} variant="outline" className="flex-1 border-slate-600">
          Analytics
        </Button>
      </div>
    </div>
  )
}
