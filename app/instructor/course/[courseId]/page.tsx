'use client'

import React from "react"

import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Module {
  id: string
  week_number: number
  title: string
  description: string
}

interface CourseData {
  id: string
  title: string
  description: string
  total_modules: number
}

export default function CoursePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { courseId } = useParams()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModule, setShowAddModule] = useState(false)
  const [newModule, setNewModule] = useState({
    week_number: 1,
    title: '',
    description: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData()
    }
  }, [courseId, user])

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('instructor_id', user?.id)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('week_number', { ascending: true })

      if (modulesError) throw modulesError
      setModules(modulesData || [])
    } catch (err) {
      console.error('Error fetching course:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          week_number: newModule.week_number,
          title: newModule.title,
          description: newModule.description,
        })
        .select()

      if (error) throw error
      setModules([...modules, data[0]].sort((a, b) => a.week_number - b.week_number))
      setNewModule({ week_number: modules.length + 1, title: '', description: '' })
      setShowAddModule(false)
    } catch (err) {
      console.error('Error adding module:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-6">Course not found</p>
          <Link href="/instructor/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link href="/instructor/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <p className="text-gray-400 mt-1">{course.description}</p>
            </div>
            <Button onClick={() => setShowAddModule(true)} className="bg-green-600 hover:bg-green-700">
              Add Module/Week
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add Module Form */}
        {showAddModule && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Module/Week</h2>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Week Number</label>
                  <input
                    type="number"
                    value={newModule.week_number}
                    onChange={(e) => setNewModule({ ...newModule, week_number: parseInt(e.target.value) })}
                    min="1"
                    max="12"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Module Title</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Module
                </Button>
                <Button type="button" variant="outline" className="border-slate-600 bg-transparent" onClick={() => setShowAddModule(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Modules List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
          {modules.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
              <p className="text-gray-400 mb-4">No modules added yet.</p>
              <Button onClick={() => setShowAddModule(true)} className="bg-blue-600 hover:bg-blue-700">
                Add First Module
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} courseId={courseId as string} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ModuleCard({ module, courseId }: { module: Module; courseId: string }) {
  const router = useRouter()
  const [lessonCount, setLessonCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [labCount, setLabCount] = useState(0)

  useEffect(() => {
    fetchCounts()
  }, [module.id])

  const fetchCounts = async () => {
    try {
      const { count: lessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', module.id)

      const { count: quizzes } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', 'in(select id from lessons where module_id=$1)')

      const { count: labs } = await supabase
        .from('labs')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', module.id)

      setLessonCount(lessons || 0)
      setLabCount(labs || 0)
    } catch (err) {
      console.error('Error fetching counts:', err)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Week {module.week_number}: {module.title}</h3>
          <p className="text-gray-400 mt-1">{module.description}</p>
        </div>
      </div>
      <div className="flex gap-2 text-sm text-gray-400 mb-6">
        <span>📝 {lessonCount} Lessons</span>
        <span>🧪 {labCount} Labs</span>
        <span>📋 {quizCount} Quizzes</span>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => router.push(`/instructor/module/${module.id}/edit`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Manage Content
        </Button>
      </div>
    </div>
  )
}
