import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkCertificateEligibility, issueCertificate } from '@/lib/certificates'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId } = await request.json()

    if (!studentId || !courseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check eligibility
    const isEligible = await checkCertificateEligibility(supabase, studentId, courseId)

    if (!isEligible) {
      return NextResponse.json(
        { error: 'Student is not eligible for certificate' },
        { status: 403 }
      )
    }

    // Get final score
    const { data: grades } = await supabase
      .from('grades_summary')
      .select('overall_score')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    if (!grades) {
      return NextResponse.json(
        { error: 'No grades found' },
        { status: 404 }
      )
    }

    // Issue certificate
    const result = await issueCertificate(
      supabase,
      studentId,
      courseId,
      grades.overall_score
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, certificateId: result.certificateId })
  } catch (error) {
    console.error('Certificate error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('id')

    if (!certificateId) {
      return NextResponse.json({ error: 'Missing certificate ID' }, { status: 400 })
    }

    // Get certificate
    const { data: certificate } = await supabase
      .from('certificates')
      .select(
        `
        *,
        student:users(full_name),
        course:courses(title, instructor_id)
      `
      )
      .eq('id', certificateId)
      .single()

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, certificate })
  } catch (error) {
    console.error('Certificate fetch error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
