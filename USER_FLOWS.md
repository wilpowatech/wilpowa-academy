# DevCourse Platform - User Flow Diagrams

## 1. Authentication Flow

```
┌─────────────────┐
│ Landing Page    │
│    (/)          │
└────────┬────────┘
         │
    Not Logged In
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌────────┐  ┌────────┐
│ Sign   │  │ Sign   │
│  Up    │  │  In    │
└───┬────┘  └───┬────┘
    │           │
    └─────┬─────┘
          │
          ▼
    ┌──────────────────┐
    │  Email Verify    │
    │ (Supabase Auth)  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Role Selection   │
    │ (Student/Instr)  │
    └────────┬─────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌─────────────────┐
│ Student     │  │ Instructor      │
│ Dashboard   │  │ Dashboard       │
│ (/student)  │  │ (/instructor)   │
└─────────────┘  └─────────────────┘
```

## 2. Student Learning Flow

```
┌────────────────────────────┐
│ Student Dashboard          │
│ - 12-Week Countdown        │
│ - Active Enrollments       │
└───────────┬────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ Select Course     │
    │ (Timer: 84 days)  │
    └────────┬──────────┘
             │
    ┌────────┴─────────────────────────────┐
    │                                       │
    ▼                                       ▼
┌─────────────────┐        ┌──────────────────────┐
│  Week 1-3       │        │  Week 1-3 (Repeat)   │
│ Lectures, Labs, │        │                      │
│ Quizzes         │        │  Activities          │
└────────┬────────┘        │  1. View Lecture     │
         │                 │  2. Take Quiz        │
         │                 │  3. Submit Lab       │
         │                 └──────┬───────────────┘
         │                        │
    ┌────┴────────────────────────┘
    │
    ▼
┌────────────────────┐
│ Week 4: EXAM 1     │
│ Timed: 60 minutes  │
│ 10 Questions       │
│ Passing: 70%       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Score: 85%  ✓ PASS│
└────────┬───────────┘
         │
         ▼
    ┌─────────────────┐
    │  Week 5-7       │
    │ More content    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Week 8: EXAM 2  │
    │ Timed: 90 min   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Week 9-11      │
    │ Continued work  │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────┐
    │ Week 12: EXAM 4  │
    │ + Final Exams    │
    └────────┬─────────┘
             │
             ▼
┌──────────────────────────┐
│ Final Grade Calculated   │
│ Labs (40%) + Quiz (30%)  │
│ + Exams (30%)            │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 ≥70%       <70%
   │           │
   ▼           ▼
┌──────┐   ┌──────────┐
│  ✓   │   │  ✗      │
│ CERT │   │ RETAKE   │
└──────┘   │ OPTION   │
           └──────────┘
```

## 3. Lab Submission & Plagiarism Check

```
┌──────────────────┐
│ Student Views    │
│ Lab Assignment   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Reads Requirements       │
│ - Problem statement      │
│ - Expected output        │
│ - Point value: 100       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────┐
│ Student Writes Code  │
│ (Code Editor)        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────┐
│ Clicks "Submit Lab"      │
└────────┬─────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │ PLAGIARISM CHECK RUNS           │
    │                                 │
    │ 1. Normalize submitted code     │
    │ 2. Compare to all submissions   │
    │ 3. Calculate similarity %       │
    │ 4. Extract & compare blocks     │
    │ 5. Generate violation report    │
    └────────┬────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
 <70%           ≥70% FLAGGED
 PASS            │
 │              ▼
 │         ┌──────────────────┐
 │         │ WARNING SHOWN     │
 │         │ "85% similarity"  │
 │         │                  │
 │         │ Matched sources:  │
 │         │ - Submission 1    │
 │         │ - Submission 5    │
 │         └────────┬─────────┘
 │                  │
 │         ┌────────┴──────────┐
 │         │                   │
 │         ▼                   ▼
 │    REJECT         OPTIONS:
 │    └─ Cannot      1. Modify & Resubmit
 │       Submit      2. Ask Instructor
 │                   3. Appeal
 │
 ▼
ACCEPT SUBMISSION
│
├─ Save to lab_submissions
├─ Create violation record (if flagged)
├─ Update grade_summary
├─ Notify instructor
│
▼
SUBMITTED
│
├─ Status: "submitted" → "graded"
├─ Wait for instructor review
├─ Points assigned (0-100)
│
▼
GRADE APPEARS IN:
├─ Student dashboard
├─ Progress report
├─ Overall grade (via lab_score)
└─ Certificate eligibility calc
```

## 4. Exam Taking Flow

```
┌──────────────────────┐
│ Exam Available       │
│ (Week 4, 8, 10, 12)  │
└────────┬─────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Student Clicks "Start Exam"    │
│                                │
│ Exam Details:                  │
│ - Questions: 10-20             │
│ - Time Limit: 60-120 minutes   │
│ - Passing Score: 70%           │
│ - Instructions displayed       │
└────────┬───────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │ TIMER STARTS                │
    │ "60:00" (countdown)         │
    └────────┬────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Question 1 / 10                │
    │                                │
    │ "What is JavaScript?"          │
    │ ◯ A language for web         │
    │ ◯ A coffee brand             │
    │ ◯ A framework                │
    │ ◯ An operating system        │
    │                                │
    │ [NEXT →]  [← PREV]            │
    │ Timer: 59:45                  │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Answer all questions   │
    │ Navigate with arrows   │
    │ Review before submit   │
    │ 6 / 10 answered        │
    └────────┬───────────────┘
             │
    ┌────────┴──────────────┐
    │                       │
    ▼                       ▼
  TIME                 STUDENT
 EXPIRES            CLICKS SUBMIT
  │                      │
  │                      ▼
  │              ┌─────────────────┐
  │              │ Confirm Submit? │
  │              │ Can't retake    │
  │              │ [Cancel] [OK]   │
  │              └────────┬────────┘
  │                       │
  └───────────┬───────────┘
              │
              ▼
    ┌──────────────────────┐
    │ SCORING BEGINS       │
    │                      │
    │ For each question:   │
    │ - Check selected ans │
    │ - Compare to correct │
    │ - Award points or 0  │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ EXAM GRADED          │
    │                      │
    │ Score: 85%           │
    │ Result: ✓ PASSED     │
    │                      │
    │ (70% required)       │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Save to exam_submissions │
    │ Update grades_summary    │
    │ Recalculate final grade  │
    │ Check certificate status │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────┐
    │ RESULTS SHOWN    │
    │ TO STUDENT       │
    │ (Can't retake)   │
    └──────────────────┘
```

## 5. Grading & Certificate Flow

```
┌──────────────────────────┐
│ All 12 Weeks Complete    │
│                          │
│ - Enrolled for 12 weeks  │
│ - All exams taken        │
│ - All labs submitted     │
│ - All quizzes completed  │
└────────┬─────────────────┘
         │
         ▼
    ┌───────────────────────────────┐
    │ FINAL GRADE CALCULATED        │
    │                               │
    │ Lab Score: 88%                │
    │ Quiz Score: 82%               │
    │ Exam 1: 85%  Exam 2: 88%      │
    │ Exam 3: 90%  Exam 4: 92%      │
    │ (Exam Avg: 88%)               │
    │                               │
    │ Formula:                      │
    │ (88 × 0.40) + (82 × 0.30) +  │
    │ (88 × 0.30) = 86.6%           │
    └────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
 ≥70%             <70%
 PASS             FAIL
 │                │
 ▼                ▼
┌──────────────┐  ┌──────────────────┐
│ CHECK STATUS │  │ NO CERTIFICATE   │
│              │  │ Retake option    │
│ • Violations?│  │                  │
│ • 3+ strikes?│  │ Can retake labs  │
│              │  │ & exams          │
└────────┬─────┘  └──────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 ELIGIBLE   INELIGIBLE
   │          │
   │          └─ No certificate
   │          └─ Cannot access
   │             cert page
   │
   ▼
┌──────────────────────────────┐
│ CERTIFICATE ISSUED           │
│                              │
│ Certificate Number:          │
│ DC-ABC123DEF-456GHI          │
│                              │
│ Student: Jane Student        │
│ Course: Full Stack Dev       │
│ Score: 86.6%                 │
│ Date: January 15, 2025       │
│ Instructor: John Instructor  │
│                              │
│ Status: ISSUED ✓             │
└────────┬─────────────────────┘
         │
         ▼
    ┌─────────────────────┐
    │ STUDENT CAN:        │
    │                     │
    │ 1. View Certificate │
    │ 2. Download PDF     │
    │ 3. Share Link       │
    │ 4. Print            │
    │ 5. Add to Resume    │
    └─────────────────────┘
```

## 6. Instructor Dashboard Flow

```
┌─────────────────────┐
│ Instructor Login    │
│ (/instructor/auth)  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Instructor Dashboard        │
│ (/instructor/dashboard)     │
│                             │
│ [+ Create Course]           │
│ [+ Analytics] [Students]    │
└────────┬────────────────────┘
         │
    ┌────┴─────────────┐
    │                  │
    ▼                  ▼
┌──────────────┐  ┌────────────┐
│ MANAGE       │  │ VIEW       │
│ COURSES      │  │ ANALYTICS  │
│              │  │            │
│ • Edit       │  │ • Students │
│ • Add Content│  │ • Grades   │
│ • View Grade │  │ • Dropouts │
│ • Revoke Cert│  │ • Plagiarism
└────────┬─────┘  └────────────┘
         │
         ▼
    ┌────────────────────────────┐
    │ SELECT COURSE              │
    │ "Full Stack Development"   │
    └────────┬───────────────────┘
             │
    ┌────────┴─────────────────────────┐
    │                                  │
    ▼                                  ▼
┌──────────────────┐      ┌────────────────────┐
│ CONTENT MGMT     │      │ STUDENT ANALYTICS  │
│                  │      │                    │
│ • Weeks 1-12     │      │ • 34 Enrolled      │
│ • Add Lectures   │      │ • 28 Active        │
│ • Add Labs       │      │ • 6 Dropped        │
│ • Add Quizzes    │      │ • Avg: 78%         │
│ • Add Exams      │      │ • Avg Time: 8 hrs  │
└────────┬─────────┘      └────────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │ SELECT WEEK 1        │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ ADD LECTURE              │
    │ Title: "Intro to JS"     │
    │ Content: [Rich Editor]   │
    │ Video: [Upload/Link]     │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ ADD LAB                  │
    │ Title: "Build TODO App"  │
    │ Instructions: [Text]     │
    │ Points: 100              │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ ADD QUIZ                 │
    │ [Q1] What is JS?         │
    │ [Q2] Explain Async/Await │
    │ [Q3] Closures?           │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Week Content Live!       │
    │                          │
    │ Students can:            │
    │ - Access lectures        │
    │ - Submit labs            │
    │ - Take quizzes           │
    │ - Get grades             │
    └──────────────────────────┘
```

## 7. Plagiarism Violation & Strike System

```
┌──────────────────┐
│ Lab Submitted    │
│ Similarity: 95%  │
└────────┬─────────┘
         │
         ▼
    ┌─────────────────────┐
    │ FLAGGED FOR         │
    │ PLAGIARISM          │
    │                     │
    │ Strike 1 of 3       │
    │ Status: Warning     │
    └────────┬────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Student Notified         │
    │ Can Resubmit             │
    │ (Different code required)│
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Student Modifies Code    │
    │ Resubmits                │
    │ Similarity: 35% ✓        │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Violation RESOLVED       │
    │ Strike removed           │
    │ Submission accepted      │
    └──────────────────────────┘

BUT IF...

    3+ Strikes → Student INELIGIBLE
              → Cannot submit more work
              → Cannot get certificate
              → Instructor can appeal
```

## 8. Multi-Instructor Isolation

```
┌──────────────────────────┐
│ Instructor A             │
│ Course: "Web Dev"        │
└────────┬─────────────────┘
         │
         ├─ Can see only own courses ✓
         ├─ Can see only own students ✓
         ├─ Cannot see Instructor B's students ✗
         ├─ Cannot see Instructor B's courses ✗
         │
         ▼
    ┌──────────────────┐
    │ RLS Policy:      │
    │ instructor_id    │
    │ = auth.uid()     │
    └──────────────────┘

Same for Instructor B - completely isolated data
```

---

**These flows show the complete user experience from signup through certification. Each step is implemented in the codebase with proper data validation and security checks.**
