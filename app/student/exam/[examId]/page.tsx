'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Exam {
  id: string
  title: string
  description: string
  exam_number: number
  week_number: number
  total_questions: number
  passing_score: number
  time_limit_minutes: number
  points_total: number
}

interface ExamQuestion {
  id: string
  question_text: string
  question_type: string
  points: number
  order_number: number
  answers: Array<{
    id: string
    answer_text: string
    is_correct: boolean
    order_number: number
  }>
}

interface ExamSubmission {
  id: string
  exam_id: string
  submitted_at: string
  score: number
  passed: boolean
  status: string
}

export default function ExamPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { examId } = useParams()
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [submission, setSubmission] = useState<ExamSubmission | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [showExam, setShowExam] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (examId && user && profile?.role === 'student') {
      fetchExamData()
    }
  }, [examId, user, profile])

  const fetchExamData = async () => {
    try {
      // Fetch exam
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (examError) throw examError
      setExam(examData)

      // Fetch questions
      const { data: questionsData } = await supabase
        .from('exam_questions')
        .select(
          `
          id,
          question_text,
          question_type,
          points,
          order_number,
          answers:exam_answers(id, answer_text, is_correct, order_number)
        `
        )
        .eq('exam_id', examId)
        .order('order_number', { ascending: true })

      setQuestions(questionsData || [])

      // Check for existing submission
      const { data: submissionData } = await supabase
        .from('exam_submissions')
        .select('*')
        .eq('exam_id', examId)
        .eq('student_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(1)

      if (submissionData && submissionData.length > 0) {
        setSubmission(submissionData[0])
      }
    } catch (err) {
      console.error('Error fetching exam:', err)
    } finally {
      setPageLoading(false)
    }
  }

  // Timer logic
  useEffect(() => {
    if (!showExam || !exam) return

    const endTime = Date.now() + exam.time_limit_minutes * 60 * 1000
    setTimeRemaining(exam.time_limit_minutes * 60)

    const interval = setInterval(() => {
      const remaining = Math.round((endTime - Date.now()) / 1000)
      if (remaining <= 0) {
        handleSubmitExam()
        clearInterval(interval)
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [showExam, exam])

  const handleStartExam = () => {
    setShowExam(true)
  }

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const handleSubmitExam = async () => {
    setSubmitting(true)
    try {
      // Calculate score
      let score = 0
      let totalPoints = 0

      for (const question of questions) {
        totalPoints += question.points
        const selectedAnswerId = answers[question.id]
        const selectedAnswer = question.answers.find((a) => a.id === selectedAnswerId)

        if (selectedAnswer?.is_correct) {
          score += question.points
        }
      }

      const percentage = (score / totalPoints) * 100

      // Save submission
      const { data, error } = await supabase
        .from('exam_submissions')
        .insert({
          student_id: user?.id,
          exam_id: examId,
          status: 'graded',
          score: Math.round(percentage * 100) / 100,
          passed: percentage >= exam!.passing_score,
          completed_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      setSubmission(data[0])
      setShowExam(false)
      alert(
        `Exam submitted! Your score: ${Math.round(percentage * 100) / 100}% ${percentage >= exam!.passing_score ? '✓ Passed' : '✗ Did not pass'}`
      )
    } catch (err) {
      console.error('Error submitting exam:', err)
      alert('Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-gray-300">Exam not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">📊 Exam {exam.exam_number}</h1>
            <p className="text-gray-400 text-sm mt-1">{exam.title}</p>
          </div>
          {showExam && timeRemaining !== null && (
            <div className={`text-center ${timeRemaining < 300 ? 'text-red-400' : 'text-blue-400'}`}>
              <p className="text-sm text-gray-400">Time Remaining</p>
              <p className="text-3xl font-bold font-mono">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showExam ? (
          <div className="space-y-6">
            {/* Exam Info */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Exam Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <InfoCard label="Questions" value={exam.total_questions} />
                <InfoCard label="Time Limit" value={`${exam.time_limit_minutes} min`} />
                <InfoCard label="Total Points" value={exam.points_total} />
                <InfoCard label="Passing Score" value={`${exam.passing_score}%`} />
              </div>
              <p className="text-gray-400 mb-6">{exam.description}</p>

              {submission ? (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-6">
                  <p className="text-gray-300 font-semibold mb-2">Previous Attempt</p>
                  <p className="text-gray-400">
                    Score: <span className="text-blue-400 font-bold">{submission.score}%</span>
                  </p>
                  <p className="text-gray-400">
                    Status: {submission.passed ? <span className="text-green-400">✓ Passed</span> : <span className="text-red-400">✗ Failed</span>}
                  </p>
                </div>
              ) : null}

              <Button onClick={handleStartExam} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                Start Exam
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Instructions</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• You have {exam.time_limit_minutes} minutes to complete this exam</li>
                <li>• Answer all {exam.total_questions} questions</li>
                <li>• You must score at least {exam.passing_score}% to pass</li>
                <li>• Your answers are automatically saved as you progress</li>
                <li>• You can review your answers before submitting</li>
                <li>• Once submitted, you cannot retake the exam</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Exam Questions */}
            {questions.map((question, index) => (
              <div key={question.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">Question {index + 1}</h3>
                    <span className="text-sm text-gray-400">{question.points} points</span>
                  </div>
                  <p className="text-gray-300">{question.question_text}</p>
                </div>

                <div className="space-y-3">
                  {question.answers.map((answer) => (
                    <label key={answer.id} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={question.id}
                        value={answer.id}
                        checked={answers[question.id] === answer.id}
                        onChange={() => handleAnswerChange(question.id, answer.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 bg-slate-700 hover:bg-slate-600 transition rounded-lg p-4">
                        <p className="text-gray-300 group-hover:text-white transition">{answer.answer_text}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sticky bottom-0">
              <div className="flex gap-4">
                <Button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
                <Button variant="outline" size="lg" className="flex-1 border-slate-600 bg-transparent" disabled>
                  {Object.keys(answers).length} / {questions.length} answered
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-2xl font-bold text-blue-400">{value}</p>
    </div>
  )
}
