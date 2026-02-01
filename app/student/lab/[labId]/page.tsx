'use client'

import React from "react"

import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { checkPlagiarism } from '@/lib/plagiarism'
import Link from 'next/link'

interface Lab {
  id: string
  title: string
  description: string
  instructions: string
  points_total: number
  module_id: string
}

interface Submission {
  id: string
  submitted_code: string
  submitted_at: string
  status: string
  score: number
  feedback: string
}

export default function LabPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { labId } = useParams()
  const [lab, setLab] = useState<Lab | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [plagiarismCheck, setPlagiarismCheck] = useState<{
    score: number
    flagged: boolean
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (labId && user && profile?.role === 'student') {
      fetchLabData()
    }
  }, [labId, user, profile])

  const fetchLabData = async () => {
    try {
      const { data: labData, error: labError } = await supabase
        .from('labs')
        .select('*')
        .eq('id', labId)
        .single()

      if (labError) throw labError
      setLab(labData)

      // Get student's existing submission
      const { data: submissionData } = await supabase
        .from('lab_submissions')
        .select('*')
        .eq('lab_id', labId)
        .eq('student_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(1)

      if (submissionData && submissionData.length > 0) {
        setSubmission(submissionData[0])
        setCode(submissionData[0].submitted_code)
      }
    } catch (err) {
      console.error('Error fetching lab:', err)
      setError('Failed to load lab')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Run plagiarism check
      const { data: allSubmissions } = await supabase
        .from('lab_submissions')
        .select('id, submitted_code')
        .eq('lab_id', labId)
        .neq('student_id', user?.id)

      const plagiarismResult = await checkPlagiarism(code, allSubmissions || [])
      setPlagiarismCheck({
        score: plagiarismResult.similarityScore,
        flagged: plagiarismResult.flagged,
      })

      // If flagged for plagiarism, don't save yet
      if (plagiarismResult.flagged) {
        setError(`⚠️ Warning: Your code has ${plagiarismResult.similarityScore}% similarity with other submissions. Please review and resubmit.`)
        setSubmitting(false)
        return
      }

      // Save submission
      const { data, error: submitError } = await supabase
        .from('lab_submissions')
        .insert({
          student_id: user?.id,
          lab_id: labId,
          submitted_code: code,
          status: 'submitted',
        })
        .select()

      if (submitError) throw submitError

      // Record plagiarism check
      await supabase.from('plagiarism_checks').insert({
        submission_id: data[0].id,
        similarity_score: plagiarismResult.similarityScore,
        matched_sources: plagiarismResult.matchedSources.join(','),
        flagged: plagiarismResult.flagged,
      })

      setSubmission(data[0])
      setCode('')
      alert('Lab submitted successfully!')
    } catch (err) {
      console.error('Error submitting lab:', err)
      setError((err as Error).message || 'Failed to submit lab')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading lab...</p>
        </div>
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-6">Lab not found</p>
          <Link href="/student/dashboard">
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
          <Link href="/student/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white">🧪 {lab.title}</h1>
          <p className="text-gray-400 mt-1">Points: {lab.points_total}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lab Instructions */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Lab Instructions</h2>
              <p className="text-gray-400 whitespace-pre-wrap">{lab.instructions}</p>
            </div>

            {submission && (
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Last Submission</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    <span className="font-semibold">Status:</span> {submission.status}
                  </p>
                  {submission.score && (
                    <p className="text-gray-400">
                      <span className="font-semibold">Score:</span> {submission.score}%
                    </p>
                  )}
                  <p className="text-gray-400">
                    <span className="font-semibold">Submitted:</span>{' '}
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Code Editor and Submission */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={16}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your code here..."
                  required
                />
              </div>

              {plagiarismCheck && (
                <div
                  className={`p-4 rounded-lg border ${
                    plagiarismCheck.flagged
                      ? 'bg-red-500/10 border-red-500/50 text-red-400'
                      : 'bg-green-500/10 border-green-500/50 text-green-400'
                  }`}
                >
                  <p className="font-semibold">
                    Plagiarism Check: {plagiarismCheck.score}% similarity
                  </p>
                  {plagiarismCheck.flagged && (
                    <p className="text-sm mt-1">
                      ⚠️ Your code is flagged as potentially plagiarized. Please review and modify your code.
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || !code.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                {submitting ? 'Checking & Submitting...' : 'Submit Lab'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
