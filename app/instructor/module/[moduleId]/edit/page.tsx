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
  course_id: string
}

interface Lesson {
  id: string
  title: string
  order_number: number
}

interface Lab {
  id: string
  title: string
  order_number: number
}

interface Quiz {
  id: string
  title: string
}

type ContentType = 'lesson' | 'lab' | 'quiz' | 'exam'

export default function ModuleEditPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { moduleId } = useParams()
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ContentType>('lesson')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (moduleId && user) {
      fetchModuleData()
    }
  }, [moduleId, user])

  const fetchModuleData = async () => {
    try {
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()

      if (moduleError) throw moduleError
      setModule(moduleData)

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_number', { ascending: true })

      setLessons(lessonsData || [])

      const { data: labsData } = await supabase
        .from('labs')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_number', { ascending: true })

      setLabs(labsData || [])
    } catch (err) {
      console.error('Error fetching module:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (activeTab === 'lesson') {
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleId,
            title: formData.title,
            description: formData.description,
            content: formData.content,
            order_number: lessons.length + 1,
          })
          .select()

        if (error) throw error
        setLessons([...lessons, data[0]])
      } else if (activeTab === 'lab') {
        const { data, error } = await supabase
          .from('labs')
          .insert({
            module_id: moduleId,
            title: formData.title,
            instructions: formData.content,
            description: formData.description,
            order_number: labs.length + 1,
          })
          .select()

        if (error) throw error
        setLabs([...labs, data[0]])
      }

      setFormData({ title: '', description: '', content: '' })
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding content:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading module...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-gray-300">Module not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/instructor/course/${module.course_id}`} className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-white">Week {module.week_number}: {module.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {(['lesson', 'lab', 'quiz', 'exam'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'lesson' && '📝 Lectures'}
              {tab === 'lab' && '🧪 Labs'}
              {tab === 'quiz' && '📋 Quizzes'}
              {tab === 'exam' && '📊 Exams'}
            </button>
          ))}
        </div>

        {/* Add Content Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            Add {activeTab === 'lesson' && 'Lecture'} {activeTab === 'lab' && 'Lab'} {activeTab === 'quiz' && 'Quiz'} {activeTab === 'exam' && 'Exam'}
          </Button>
        </div>

        {/* Add Content Form */}
        {showAddForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Add New {activeTab === 'lesson' && 'Lecture'} {activeTab === 'lab' && 'Lab'} {activeTab === 'quiz' && 'Quiz'} {activeTab === 'exam' && 'Exam'}
            </h2>
            <form onSubmit={handleAddContent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {activeTab === 'lesson' && 'Lecture Content (Markdown)'}
                  {activeTab === 'lab' && 'Lab Instructions'}
                  {activeTab === 'quiz' && 'Quiz Details'}
                  {activeTab === 'exam' && 'Exam Details'}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg font-mono text-sm"
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Content
                </Button>
                <Button type="button" variant="outline" className="border-slate-600 bg-transparent" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Content List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {activeTab === 'lesson' && `Lectures (${lessons.length})`}
            {activeTab === 'lab' && `Labs (${labs.length})`}
            {activeTab === 'quiz' && 'Quizzes'}
            {activeTab === 'exam' && 'Exams'}
          </h2>

          {activeTab === 'lesson' && (
            <div className="grid grid-cols-1 gap-4">
              {lessons.map((lesson) => (
                <ContentCard key={lesson.id} item={lesson} type="lesson" />
              ))}
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="grid grid-cols-1 gap-4">
              {labs.map((lab) => (
                <ContentCard key={lab.id} item={lab} type="lab" />
              ))}
            </div>
          )}

          {(activeTab === 'quiz' || activeTab === 'exam') && (
            <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
              <p className="text-gray-400 mb-4">Quiz and Exam management coming soon. Use the Add button above to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ContentCard({ item, type }: { item: Lesson | Lab; type: 'lesson' | 'lab' }) {
  const router = useRouter()
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{item.title}</h3>
          <p className="text-gray-400 text-sm">
            {type === 'lesson' ? '📝 Lecture' : '🧪 Lab'} #{(item as any).order_number}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => router.push(`/instructor/${type}/${item.id}/edit`)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Edit
        </Button>
        <Button variant="outline" className="border-slate-600 bg-transparent">
          Preview
        </Button>
      </div>
    </div>
  )
}
