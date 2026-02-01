import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { updateGradesSummary } from '@/lib/grading'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId } = await request.json()

    if (!studentId || !courseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update grades summary
    const success = await updateGradesSummary(supabase, studentId, courseId)

    if (!success) {
      return NextResponse.json({ error: 'Failed to update grades' }, { status: 500 })
    }

    // Get updated grades
    const { data: grades } = await supabase
      .from('grades_summary')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    return NextResponse.json({ success: true, grades })
  } catch (error) {
    console.error('Grading error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
