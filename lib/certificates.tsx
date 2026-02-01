/**
 * Certificate Generation and Management
 */

import { v4 as uuidv4 } from 'uuid'
import { checkCertificateEligibility } from './grading'

// Re-export for convenience
export { checkCertificateEligibility }

interface CertificateData {
  certificateNumber: string
  studentName: string
  courseName: string
  completionDate: string
  finalScore: number
  instructorName: string
}

/**
 * Generate unique certificate number
 */
function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `DC-${timestamp}-${random}`
}

/**
 * Create certificate for student
 */
export async function issueCertificate(
  supabase: any,
  studentId: string,
  courseId: string,
  finalScore: number
): Promise<{ success: boolean; certificateId?: string; error?: string }> {
  try {
    // Check eligibility
    const { data: grades } = await supabase
      .from('grades_summary')
      .select('overall_score')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single()

    if (!grades || grades.overall_score < 70) {
      return { success: false, error: 'Student has not achieved a passing grade' }
    }

    // Check for unresolved violations
    const { data: violations } = await supabase
      .from('violations')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('resolved', false)

    if (violations && violations.length >= 3) {
      return { success: false, error: 'Student has unresolved policy violations' }
    }

    // Generate certificate
    const certificateNumber = generateCertificateNumber()
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        student_id: studentId,
        course_id: courseId,
        certificate_number: certificateNumber,
        status: 'issued',
        issued_at: new Date().toISOString(),
        final_score: finalScore,
      })
      .select()

    if (error) throw error

    return { success: true, certificateId: data[0].id }
  } catch (err) {
    console.error('Error issuing certificate:', err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * Generate certificate HTML for PDF or display
 */
export function generateCertificateHTML(certificateData: CertificateData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DevCourse Certificate</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: 'Georgia', serif;
          background: #f0f0f0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .certificate {
          width: 11in;
          height: 8.5in;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 3px solid #1e40af;
          border-radius: 10px;
          padding: 40px;
          box-sizing: border-box;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          color: #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(29, 78, 216, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .content {
          position: relative;
          z-index: 1;
          text-align: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
        .header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #64748b;
          font-style: italic;
        }
        .title {
          font-size: 56px;
          font-weight: bold;
          color: #fff;
          margin: 20px 0;
          letter-spacing: 2px;
        }
        .recipient {
          font-size: 32px;
          color: #3b82f6;
          font-weight: bold;
          margin: 20px 0;
          text-decoration: underline;
        }
        .description {
          font-size: 18px;
          color: #cbd5e1;
          margin: 20px 0;
          line-height: 1.6;
        }
        .course-name {
          font-size: 28px;
          color: #60a5fa;
          font-weight: bold;
          margin: 15px 0;
        }
        .score {
          font-size: 18px;
          color: #cbd5e1;
          margin: 15px 0;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 30px;
          border-top: 2px solid #3b82f6;
          padding-top: 20px;
          font-size: 14px;
        }
        .signature-area {
          text-align: center;
        }
        .signature-line {
          border-top: 2px solid #cbd5e1;
          width: 150px;
          margin: 10px auto 5px;
        }
        .cert-number {
          font-size: 12px;
          color: #64748b;
          margin-top: 10px;
          font-family: 'Courier New', monospace;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="content">
          <div class="header">
            <div class="logo">🎓 DevCourse</div>
            <div class="subtitle">Professional Software Development Platform</div>
          </div>

          <div>
            <div class="title">Certificate of Completion</div>
            
            <p class="description">This certificate is proudly presented to</p>
            
            <div class="recipient">${certificateData.studentName}</div>
            
            <p class="description">for successfully completing the course</p>
            
            <div class="course-name">${certificateData.courseName}</div>
            
            <div class="score">Final Score: ${certificateData.finalScore}%</div>
            
            <p class="description">with demonstrated excellence in software development skills</p>
          </div>

          <div class="footer">
            <div class="signature-area">
              <div class="signature-line"></div>
              <p>${certificateData.instructorName}</p>
              <p>Instructor</p>
            </div>
            <div class="signature-area">
              <p>${certificateData.completionDate}</p>
              <p>Date of Completion</p>
            </div>
            <div class="signature-area">
              <div class="cert-number">${certificateData.certificateNumber}</div>
              <p>Certificate Number</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Get student's certificate
 */
export async function getStudentCertificate(
  supabase: any,
  studentId: string,
  courseId: string
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(
        `
        *,
        student:users(full_name),
        course:courses(title, instructor_id)
      `
      )
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('status', 'issued')
      .order('issued_at', { ascending: false })
      .limit(1)

    if (error) throw error
    return data?.[0] || null
  } catch (err) {
    console.error('Error fetching certificate:', err)
    return null
  }
}

/**
 * List all student certificates
 */
export async function listStudentCertificates(supabase: any, studentId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(
        `
        *,
        course:courses(title, instructor_id)
      `
      )
      .eq('student_id', studentId)
      .eq('status', 'issued')
      .order('issued_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching certificates:', err)
    return []
  }
}

/**
 * Revoke a certificate (for academic integrity violations)
 */
export async function revokeCertificate(
  supabase: any,
  certificateId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('certificates')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString(),
      })
      .eq('id', certificateId)

    if (error) throw error

    // Log the revocation
    const certificate = await supabase
      .from('certificates')
      .select('student_id, course_id')
      .eq('id', certificateId)
      .single()

    if (certificate.data) {
      await supabase.from('violations').insert({
        student_id: certificate.data.student_id,
        course_id: certificate.data.course_id,
        violation_type: 'policy_violation',
        description: `Certificate revoked: ${reason}`,
        severity: 'critical',
      })
    }

    return true
  } catch (err) {
    console.error('Error revoking certificate:', err)
    return false
  }
}
