'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Certificate {
  id: string
  certificate_number: string
  final_score: number
  issued_at: string
  status: string
  course: {
    title: string
  }
}

export default function CertificatesPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [certLoading, setCertLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile?.role === 'student') {
      fetchCertificates()
    }
  }, [user, profile])

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(
          `
          id,
          certificate_number,
          final_score,
          issued_at,
          status,
          course:courses(title)
        `
        )
        .eq('student_id', user?.id)
        .eq('status', 'issued')
        .order('issued_at', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (err) {
      console.error('Error fetching certificates:', err)
    } finally {
      setCertLoading(false)
    }
  }

  if (loading || certLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading certificates...</p>
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
            <h1 className="text-3xl font-bold text-white">🎓 My Certificates</h1>
            <p className="text-gray-400 mt-1">Your earned course completion certificates</p>
          </div>
          <Link href="/student/dashboard">
            <Button variant="outline" className="border-slate-600 bg-transparent">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-gray-400 mb-4">
              You haven't earned any certificates yet. Complete courses with a passing grade to earn certificates.
            </p>
            <Link href="/student/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">Continue Learning</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const handleDownload = async () => {
    // Generate PDF or HTML download
    const element = document.createElement('a')
    element.href = `/api/certificate/${certificate.id}` // API route to generate certificate
    element.download = `Certificate_${certificate.certificate_number}.pdf`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleView = () => {
    window.open(`/certificate/${certificate.id}`, '_blank')
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition shadow-lg">
      {/* Certificate Preview */}
      <div className="bg-slate-700/50 border-b border-slate-600 p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="text-[200px] text-blue-400 font-bold">🎓</div>
        </div>
        <div className="relative z-10">
          <div className="text-4xl font-bold text-blue-400 mb-2">Certificate</div>
          <div className="text-gray-300 text-lg">{certificate.course.title}</div>
          <div className="text-gray-400 text-sm mt-2">Score: {certificate.final_score}%</div>
        </div>
      </div>

      {/* Certificate Details */}
      <div className="p-6 space-y-4">
        <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Certificate Number</p>
          <p className="text-white font-mono text-lg">{certificate.certificate_number}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Issued Date</p>
            <p className="text-white font-semibold">
              {new Date(certificate.issued_at).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Final Score</p>
            <p className="text-green-400 font-semibold">{certificate.final_score}%</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleView} className="flex-1 bg-blue-600 hover:bg-blue-700">
            View Certificate
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1 border-slate-600 bg-transparent">
            Download PDF
          </Button>
        </div>

        {/* Verification Badge */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <p className="text-green-400 text-sm">✓ Verified Certificate</p>
        </div>
      </div>
    </div>
  )
}
