/**
 * Plagiarism Detection Module
 * Checks code similarity using a simple algorithm
 */

interface PlagiarismResult {
  similarityScore: number
  flagged: boolean
  matchedSources: string[]
}

/**
 * Calculate similarity between two code snippets using Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      )
    }
  }

  return track[str2.length][str1.length]
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 100

  const distance = levenshteinDistance(str1, str2)
  return ((maxLength - distance) / maxLength) * 100
}

/**
 * Normalize code for comparison (remove comments, whitespace, etc.)
 */
function normalizeCode(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      // Remove single-line comments
      const withoutComments = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
      // Trim whitespace
      return withoutComments.trim()
    })
    .filter((line) => line.length > 0)
    .join('\n')
    .toLowerCase()
}

/**
 * Extract code blocks (functions, classes, etc.)
 */
function extractCodeBlocks(code: string): string[] {
  const blocks = []
  const lines = code.split('\n')
  let currentBlock = ''

  for (const line of lines) {
    if (
      line.match(/^(function|class|const|let|var|async)/) ||
      line.includes('{') ||
      line.includes('(')
    ) {
      if (currentBlock) blocks.push(currentBlock)
      currentBlock = line
    } else {
      currentBlock += '\n' + line
    }
  }

  if (currentBlock) blocks.push(currentBlock)
  return blocks.filter((block) => block.length > 10)
}

/**
 * Check for plagiarism in submitted code
 */
export async function checkPlagiarism(
  submittedCode: string,
  allSubmissions: Array<{ id: string; code: string }>
): Promise<PlagiarismResult> {
  const normalizedSubmitted = normalizeCode(submittedCode)
  const submittedBlocks = extractCodeBlocks(normalizedSubmitted)

  let maxSimilarity = 0
  const matchedSources: string[] = []

  // Compare against all previous submissions
  for (const submission of allSubmissions) {
    const normalizedPrevious = normalizeCode(submission.code)
    const previousBlocks = extractCodeBlocks(normalizedPrevious)

    for (const submittedBlock of submittedBlocks) {
      for (const previousBlock of previousBlocks) {
        const similarity = calculateSimilarity(submittedBlock, previousBlock)

        // Flag suspicious matches (>80% similarity)
        if (similarity > 80) {
          maxSimilarity = Math.max(maxSimilarity, similarity)
          if (!matchedSources.includes(submission.id)) {
            matchedSources.push(submission.id)
          }
        }
      }
    }
  }

  // Calculate overall similarity
  const overallSimilarity = calculateSimilarity(
    normalizedSubmitted,
    allSubmissions.map((s) => normalizeCode(s.code)).join('\n')
  )

  const finalScore = Math.max(overallSimilarity, maxSimilarity)

  return {
    similarityScore: Math.round(finalScore * 100) / 100,
    flagged: finalScore > 70, // Flag if >70% similar
    matchedSources,
  }
}

/**
 * Check for common patterns indicating plagiarism
 */
export function detectSuspiciousPatterns(code: string): string[] {
  const patterns: string[] = []

  // Check for suspicious variable names
  if (code.match(/var\s+(x|y|z|a|b|c|tmp|temp|t|v)\s*=/gi)) {
    patterns.push('suspicious_variable_names')
  }

  // Check for unusually complex code immediately followed by simple code
  const blocks = code.split('\n\n')
  if (blocks.length > 1) {
    const complexities = blocks.map((block) => {
      const chars = block.replace(/\s/g, '').length
      const operators = (block.match(/[+\-*/%=<>!&|]/g) || []).length
      return { chars, operators, ratio: operators / (chars || 1) }
    })

    const avgRatio = complexities.reduce((sum, c) => sum + c.ratio, 0) / complexities.length
    const outliers = complexities.filter((c) => Math.abs(c.ratio - avgRatio) > avgRatio * 0.5)

    if (outliers.length > 0) {
      patterns.push('inconsistent_complexity')
    }
  }

  // Check for suspicious formatting (too perfect or too messy)
  const indentationLevels = code.split('\n').map((line) => (line.match(/^\s*/)?.[0] || '').length)
  const avgIndent = indentationLevels.reduce((a, b) => a + b, 0) / indentationLevels.length
  const indentVariance = indentationLevels.reduce((sum, indent) => sum + Math.pow(indent - avgIndent, 2), 0) / indentationLevels.length

  if (indentVariance === 0) {
    patterns.push('suspiciously_perfect_formatting')
  }

  return patterns
}

/**
 * Create violation record for plagiarism
 */
export async function recordViolation(
  supabase: any,
  studentId: string,
  courseId: string,
  submissionId: string,
  similarityScore: number,
  matchedSources: string[]
) {
  try {
    // Get existing violation count for this student
    const { data: violations, error: fetchError } = await supabase
      .from('violations')
      .select('strike_count')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('violation_type', 'plagiarism')
      .eq('resolved', false)

    if (fetchError) throw fetchError

    const strikeCount = violations?.length || 0

    // Record the violation
    const { error: insertError } = await supabase.from('violations').insert({
      student_id: studentId,
      course_id: courseId,
      violation_type: 'plagiarism',
      description: `Code similarity: ${similarityScore}% - Matched against ${matchedSources.length} submission(s)`,
      severity: similarityScore > 90 ? 'critical' : similarityScore > 80 ? 'severe' : 'warning',
      strike_count: strikeCount + 1,
    })

    if (insertError) throw insertError

    // Create plagiarism check record
    await supabase.from('plagiarism_checks').insert({
      submission_id: submissionId,
      similarity_score: similarityScore,
      matched_sources: matchedSources.join(','),
      flagged: true,
    })

    return { success: true, strikeCount: strikeCount + 1 }
  } catch (err) {
    console.error('Error recording violation:', err)
    return { success: false, error: (err as Error).message }
  }
}
