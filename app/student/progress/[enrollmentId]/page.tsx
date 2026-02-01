'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface GradeSummary {
  lab_score: number
  quiz_score: number
  exam_1_score: number
  exam_2_score: number
  exam_3_score: number
  exam_4_score: number
  overall_score: number
}

interface CourseData {
  id: string
  title: string
  total_modules: number
}

export default function ProgressPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { enrollmentId } = useParams()
  const [grades, setGrades] = useState<GradeSummary | null>(null)
  const [course, setCourse] = useState<CourseData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (enrollmentId && user) {
      fetchProgressData()
    }
  }, [enrollmentId, user])

  const fetchProgressData = async () => {
    try {
      // Get enrollment and course
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('id', enrollmentId)
        .eq('student_id', user?.id)
        .single()

      if (!enrollment) {
        router.push('/student/dashboard')
        return
      }

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', enrollment.course_id)
        .single()

      setCourse(courseData)

      // Get grades summary
      const { data: gradesData } = await supabase
        .from('grades_summary')
        .select('*')
        .eq('student_id', user?.id)
        .eq('course_id', enrollment.course_id)
        .single()

      setGrades(gradesData)
    } catch (err) {
      console.error('Error fetching progress:', err)
    } finally {
      setPageLoading(false)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading progress...</p>
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
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">📊 {course?.title} - Progress Report</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {grades ? (
          <div className="space-y-8">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Overall Score</h2>
              <div className="flex items-end gap-6">
                <div className="text-7xl font-bold">{grades.overall_score}%</div>
                <div className="mb-2">
                  <p className="text-lg opacity-90">
                    {grades.overall_score >= 90 && 'Excellent - A'}
                    {grades.overall_score >= 80 && grades.overall_score < 90 && 'Great - B'}
                    {grades.overall_score >= 70 && grades.overall_score < 80 && 'Good - C'}
                    {grades.overall_score >= 60 && grades.overall_score < 70 && 'Satisfactory - D'}
                    {grades.overall_score < 60 && 'Needs Improvement - F'}
                  </p>
                  <p className="text-sm opacity-75">
                    {grades.overall_score >= 70 ? '✓ Passing Grade' : '✗ Below Passing Grade'}
                  </p>
                </div>
              </div>
            </div>

            {/* Grading Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScoreCard
                title="📝 Labs"
                score={grades.lab_score}
                weight="40%"
                description="Hands-on coding assignments"
              />
              <ScoreCard
                title="📋 Quizzes"
                score={grades.quiz_score}
                weight="30%"
                description="Lesson comprehension tests"
              />
              <ScoreCard
                title="📊 Exams"
                score={(grades.exam_1_score + grades.exam_2_score + grades.exam_3_score + grades.exam_4_score) / 4}
                weight="30%"
                description="Comprehensive assessments"
              />
            </div>

            {/* Exam Breakdown */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Exam Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ExamScoreCard exam={1} score={grades.exam_1_score} />
                <ExamScoreCard exam={2} score={grades.exam_2_score} />
                <ExamScoreCard exam={3} score={grades.exam_3_score} />
                <ExamScoreCard exam={4} score={grades.exam_4_score} />
              </div>
            </div>

            {/* Score Interpretation */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Scoring Breakdown</h3>
              <div className="space-y-3 text-gray-300">
                <p>
                  <span className="font-semibold">Labs (40%):</span> Practical coding skills demonstrated through lab
                  assignments
                </p>
                <p>
                  <span className="font-semibold">Quizzes (30%):</span> Understanding of course content and lesson
                  materials
                </p>
                <p>
                  <span className="font-semibold">Exams (30%):</span> Four comprehensive exams taken every 4 weeks to
                  assess overall progress
                </p>
              </div>
            </div>

            {/* Certificate Eligibility */}
            <div
              className={`rounded-xl p-8 border ${
                grades.overall_score >= 70
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">
                {grades.overall_score >= 70 ? '🎓 Certificate Eligible' : '❌ Not Eligible Yet'}
              </h3>
              <p className={grades.overall_score >= 70 ? 'text-green-400' : 'text-red-400'}>
                {grades.overall_score >= 70
                  ? 'You have achieved a passing grade and are eligible to receive your certificate upon course completion.'
                  : `You need ${Math.ceil(70 - grades.overall_score)}% more points to reach the passing grade of 70%.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No grades available yet. Start completing course work to see your progress.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function ScoreCard({
  title,
  score,
  weight,
  description,
}: {
  title: string
  score: number
  weight: string
  description: string
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <div className="text-4xl font-bold text-blue-400 mb-2">{score}%</div>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
        <div className="bg-blue-500 h-full" style={{ width: `${score}%` }}></div>
      </div>
      <p className="text-gray-400 text-xs">Weight: {weight}</p>
    </div>
  )
}

function ExamScoreCard({ exam, score }: { exam: number; score: number }) {
  return (
    <div className="bg-slate-700 rounded-lg p-4 text-center">
      <p className="text-gray-400 text-sm mb-2">Exam {exam}</p>
      <p className="text-3xl font-bold text-blue-400">{score || '-'}%</p>
      <div className="mt-2 bg-slate-600 rounded-full h-1 overflow-hidden">
        {score > 0 && <div className="bg-green-500 h-full" style={{ width: `${score}%` }}></div>}
      </div>
    </div>
  )
}
