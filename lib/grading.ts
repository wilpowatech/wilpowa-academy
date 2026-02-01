/**
 * Grading and Scoring System
 * Calculates final scores based on: Labs (40%), Quizzes (30%), Exams (30%)
 */

export interface GradingWeights {
  labWeight: number
  quizWeight: number
  examWeight: number
}

// Default weights: Labs 40%, Quizzes 30%, Exams 30%
export const DEFAULT_WEIGHTS: GradingWeights = {
  labWeight: 0.4,
  quizWeight: 0.3,
  examWeight: 0.3,
}

export interface StudentGrades {
  labScore: number
  quizScore: number
  exam1Score: number
  exam2Score: number
  exam3Score: number
  exam4Score: number
}

export interface GradingResult {
  labScore: number
  quizScore: number
  examScore: number
  overallScore: number
  isPassing: boolean
}

/**
 * Calculate average lab score
 */
export async function calculateLabScore(
  supabase: any,
  studentId: string,
  courseId: string
): Promise<number> {
  try {
    // Get all labs for the course
    const { data: labs } = await supabase
      .from('labs')
      .select('id')
      .eq('module:modules(course_id)', courseId)

    if (!labs || labs.length === 0) return 0

    const labIds = labs.map((lab) => lab.id)

    // Get submissions with scores
    const { data: submissions } = await supabase
      .from('lab_submissions')
      .select('score')
      .eq('student_id', studentId)
      .in('lab_id', labIds)
      .eq('status', 'graded')

    if (!submissions || submissions.length === 0) return 0

    const validScores = submissions
      .filter((sub) => sub.score !== null && sub.score !== undefined)
      .map((sub) => sub.score as number)

    if (validScores.length === 0) return 0

    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  } catch (err) {
    console.error('Error calculating lab score:', err)
    return 0
  }
}

/**
 * Calculate average quiz score
 */
export async function calculateQuizScore(
  supabase: any,
  studentId: string,
  courseId: string
): Promise<number> {
  try {
    // Get all quizzes for lessons in the course
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id')
      .eq('lesson:lessons(module:modules(course_id))', courseId)

    if (!quizzes || quizzes.length === 0) return 0

    const quizIds = quizzes.map((quiz) => quiz.id)

    // Get quiz submissions with scores
    const { data: submissions } = await supabase
      .from('quiz_submissions')
      .select('score')
      .eq('student_id', studentId)
      .in('quiz_id', quizIds)

    if (!submissions || submissions.length === 0) return 0

    const validScores = submissions
      .filter((sub) => sub.score !== null && sub.score !== undefined)
      .map((sub) => sub.score as number)

    if (validScores.length === 0) return 0

    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  } catch (err) {
    console.error('Error calculating quiz score:', err)
    return 0
  }
}

/**
 * Calculate average exam score
 */
export async function calculateExamScore(
  supabase: any,
  studentId: string,
  courseId: string
): Promise<number> {
  try {
    // Get all exams for the course
    const { data: exams } = await supabase
      .from('exams')
      .select('id')
      .eq('course_id', courseId)

    if (!exams || exams.length === 0) return 0

    const examIds = exams.map((exam) => exam.id)

    // Get exam submissions with scores
    const { data: submissions } = await supabase
      .from('exam_submissions')
      .select('score')
      .eq('student_id', studentId)
      .in('exam_id', examIds)

    if (!submissions || submissions.length === 0) return 0

    const validScores = submissions
      .filter((sub) => sub.score !== null && sub.score !== undefined)
      .map((sub) => sub.score as number)

    if (validScores.length === 0) return 0

    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  } catch (err) {
    console.error('Error calculating exam score:', err)
    return 0
  }
}

/**
 * Calculate final grade
 */
export async function calculateFinalGrade(
  supabase: any,
  studentId: string,
  courseId: string,
  weights = DEFAULT_WEIGHTS
): Promise<GradingResult> {
  const labScore = await calculateLabScore(supabase, studentId, courseId)
  const quizScore = await calculateQuizScore(supabase, studentId, courseId)
  const examScore = await calculateExamScore(supabase, studentId, courseId)

  const overallScore =
    labScore * weights.labWeight + quizScore * weights.quizWeight + examScore * weights.examWeight

  return {
    labScore: Math.round(labScore * 100) / 100,
    quizScore: Math.round(quizScore * 100) / 100,
    examScore: Math.round(examScore * 100) / 100,
    overallScore: Math.round(overallScore * 100) / 100,
    isPassing: overallScore >= 70,
  }
}

/**
 * Update grades summary for a student
 */
export async function updateGradesSummary(
  supabase: any,
  studentId: string,
  courseId: string
): Promise<boolean> {
  try {
    const gradeResult = await calculateFinalGrade(supabase, studentId, courseId)

    // Get individual exam scores
    const { data: exams } = await supabase
      .from('exams')
      .select('id, exam_number')
      .eq('course_id', courseId)
      .order('exam_number', { ascending: true })

    const examScores: { [key: string]: number } = {
      exam_1_score: 0,
      exam_2_score: 0,
      exam_3_score: 0,
      exam_4_score: 0,
    }

    if (exams) {
      for (const exam of exams) {
        const { data: submission } = await supabase
          .from('exam_submissions')
          .select('score')
          .eq('exam_id', exam.id)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false })
          .limit(1)

        if (submission && submission[0]?.score !== null) {
          examScores[`exam_${exam.exam_number}_score`] = submission[0].score
        }
      }
    }

    // Upsert grades summary
    const { error } = await supabase.from('grades_summary').upsert({
      student_id: studentId,
      course_id: courseId,
      lab_score: gradeResult.labScore,
      quiz_score: gradeResult.quizScore,
      ...examScores,
      overall_score: gradeResult.overallScore,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
    return true
  } catch (err) {
    console.error('Error updating grades summary:', err)
    return false
  }
}

/**
 * Check if student is eligible for certificate
 */
export async function checkCertificateEligibility(
  supabase: any,
  studentId: string,
  courseId: string
): Promise<boolean> {
  try {
    const gradeResult = await calculateFinalGrade(supabase, studentId, courseId)

    // Check for violations
    const { data: violations } = await supabase
      .from('violations')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('resolved', false)

    // If 3 or more unresolved violations, not eligible
    if (violations && violations.length >= 3) {
      return false
    }

    // Must have passing grade
    return gradeResult.isPassing
  } catch (err) {
    console.error('Error checking certificate eligibility:', err)
    return false
  }
}
