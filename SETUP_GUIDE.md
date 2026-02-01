# DevCourse Platform - Setup & Implementation Guide

## Overview

DevCourse is a professional software development bootcamp platform inspired by ALX, featuring:

- **12-Week Intensive Curriculum** with time-based progress tracking
- **Real-World Projects** with labs and practical assignments
- **Comprehensive Assessment System** including quizzes and 4 exams (1 every 4 weeks)
- **Plagiarism Detection** for lab submissions using code similarity analysis
- **Grading System** with weighted scoring: Labs (40%), Quizzes (30%), Exams (30%)
- **Certificate Generation** for students who achieve passing grades
- **Multi-Instructor Support** for scaling course delivery
- **Violation Tracking** for academic integrity enforcement

## Technology Stack

- **Frontend**: Next.js 16 with React 19.2
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Database**: PostgreSQL with comprehensive schema

## Database Schema Overview

### Core Tables

**users**
- Stores user profiles (students, instructors, admins)
- Roles: student, instructor, admin

**courses**
- Course metadata with instructor assignment
- 12-week duration structure
- Multiple modules per course

**enrollments**
- Student enrollment with start/end dates
- 12-week countdown tracking
- Status management (active, completed, dropped)

**modules** (Weekly structure)
- Weeks 1-12 of the course
- Lessons, labs, quizzes per week

**lessons**
- Video lectures with descriptions
- Markdown content support
- Ordered within modules

**labs**
- Hands-on assignments
- Point-based scoring
- Plagiarism-tracked submissions

**quizzes** & **quiz_questions**
- Multiple-choice and short-answer questions
- Passing score thresholds
- Time limits

**exams**
- 4 comprehensive exams (weeks 4, 8, 10, 12)
- High-stakes assessments
- Point-based grading

**submissions**
- Tracks all student submissions
- Status: pending, graded
- Automatic plagiarism checks

**plagiarism_checks**
- Code similarity analysis results
- Matched source tracking
- Flagging system

**violations**
- Academic integrity violations
- Strike system (3 strikes = ineligible for certificate)
- Types: plagiarism, cheating, policy_violation

**grades_summary**
- Aggregated student performance
- Weekly calculation updates
- Overall score computation

**certificates**
- Certificate of completion
- Unique certificate numbers
- Status: pending, issued, revoked
- Verification numbers

## Key Features

### For Students

1. **Dashboard** with enrollment overview and 12-week countdown
2. **Course Progress Tracking** with real-time timer
3. **Lesson Access** with video and markdown content
4. **Lab Submissions** with automatic plagiarism detection
5. **Quiz System** for self-assessment
6. **Grade Tracking** with detailed breakdowns
7. **Certificate Management** and download functionality

### For Instructors

1. **Course Management** - Create and manage courses
2. **Content Upload** - Add lectures, labs, quizzes, exams
3. **Module Management** - Organize 12-week curriculum
4. **Student Analytics** - Track enrollment and progress
5. **Grading Tools** - Review submissions and assign scores
6. **Violation Management** - Track and resolve academic integrity issues
7. **Certificate Management** - Issue/revoke certificates

### Plagiarism Detection

The platform includes a sophisticated plagiarism detection system:

- **Code Similarity Analysis** using Levenshtein distance algorithm
- **Pattern Recognition** for suspicious code formatting/structure
- **Threshold Flagging** at >70% similarity
- **Automatic Strike System** for violations
- **Violation Tracking** with severity levels (warning, severe, critical)

## Setup Instructions

### 1. Environment Variables

Add to your Vercel project settings (Settings > Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup

The schema is automatically created by running the migration script:

```bash
# This creates all tables, indexes, and RLS policies
```

### 3. User Authentication

- Users sign up with email/password
- Email verification required (sent by Supabase)
- Role selection during signup (student/instructor)
- Automatic profile creation

### 4. Instructor Workflow

1. Sign up as Instructor
2. Go to Instructor Dashboard
3. Create a new course with title, description, duration
4. Add modules (weeks) for the 12-week structure
5. For each module:
   - Add lectures with content
   - Add labs with instructions
   - Add quizzes with questions
6. Create 4 exams (assign to weeks 4, 8, 10, 12)
7. Set exam dates and passing scores

### 5. Student Workflow

1. Sign up as Student
2. Go to Student Dashboard
3. Browse available courses
4. Enroll in a course (12-week timer starts automatically)
5. Progress through:
   - Lectures (read/watch)
   - Quizzes (self-assessment)
   - Labs (code and submit with plagiarism check)
   - Exams (4 major assessments)
6. Monitor grades and progress
7. Upon completion with 70%+ grade, certificate is auto-generated

## Grading System

### Calculation

```
Final Score = (Lab Score × 0.40) + (Quiz Score × 0.30) + (Exam Score × 0.30)
```

### Lab Score (40%)
- Average of all lab submissions
- Automatic plagiarism detection applied
- Threshold: Submit unique work or flag

### Quiz Score (30%)
- Average of all quiz scores
- Per-lesson assessments
- Immediate feedback

### Exam Score (30%)
- Average of 4 exam scores
- Week 4: Exam 1 (Weeks 1-4 content)
- Week 8: Exam 2 (Weeks 1-8 content)
- Week 10: Exam 3 (Weeks 1-10 content)
- Week 12: Exam 4 (Full course content)

### Passing

- ≥70%: Passing grade → Certificate eligible
- <70%: Below passing → Cannot receive certificate

## Plagiarism Detection Details

### How It Works

1. **Code Normalization** - Remove comments, excess whitespace
2. **Block Extraction** - Isolate functions, classes, etc.
3. **Similarity Calculation** - Compare against all submissions
4. **Threshold Check** - Flag if >70% similar
5. **Strike Recording** - Track for academic integrity

### Violation Levels

- **Warning** (60-70% similarity)
- **Severe** (80-90% similarity) - May affect final grade
- **Critical** (>90% similarity) - Certificate revoked if 3+ strikes

### Student Rights

- View similarity score on submission
- Resubmit if flagged (need to improve code)
- Appeal violations to instructor
- Resolution process removes strike

## Certificate Generation

### Automatic Process

- Trigger: Student reaches 70%+ final grade
- Validation: Check for unresolved violations (max 2)
- Generation: Unique certificate number, date issued
- Status: "Issued" (visible to student)

### Certificate Contains

- Student name
- Course name
- Completion date
- Final score
- Certificate number (unique ID)
- Instructor name
- Signature placeholder

### Manual Revocation

Instructors can revoke certificates if:
- Academic integrity violations discovered later
- Grade recalculation shows below 70%
- Course requirements not actually met

Revocation automatically:
- Changes status to "revoked"
- Creates violation record
- Notifies student

## Enrollment & 12-Week Structure

### Enrollment

- Student enrolls in course
- `start_date`: Current timestamp
- `expected_end_date`: 12 weeks from start
- Countdown timer shows remaining time

### 12-Week Structure

```
Week 1-3:  Module 1 (Intro & Fundamentals)
Week 4:    Exam 1 + Module 2 begins
Week 5-7:  Module 2 continued
Week 8:    Exam 2 + Module 3 begins
Week 9-11: Module 3 continued
Week 12:   Exam 4 + Final Assessments
```

### Deadlines

- Each module has 1 week (typically)
- Labs due by end of module
- Quizzes continuous throughout
- Exams on weeks 4, 8, 10, 12

## API Routes

### Grading

`POST /api/grade`
- Updates grades summary for a student
- Recalculates overall score
- Called after each submission

### Certificates

`POST /api/certificate`
- Issues new certificate if eligible
- Validates passing grade and no violations
- Returns certificate ID

`GET /api/certificate?id=...`
- Retrieves certificate details
- Used for display/download

## Best Practices

### For Instructors

1. **Clear Rubrics** - Provide detailed lab requirements
2. **Regular Updates** - Keep content fresh and relevant
3. **Timely Feedback** - Grade submissions within 48 hours
4. **Violation Communication** - Notify students of issues early
5. **Exam Design** - Mix difficulty across 4 exams

### For Students

1. **Original Work** - Write your own code from scratch
2. **Time Management** - Don't rush labs near deadline
3. **Active Learning** - Engage with lectures and quizzes
4. **Help Seeking** - Ask instructors before submitting plagiarized work
5. **Review Feedback** - Learn from graded submissions

## Troubleshooting

### Student can't enroll

- Verify user role is "student"
- Check Supabase RLS policies
- Ensure course exists and is published

### Plagiarism check failing

- Check code normalization function
- Verify all submissions in database
- Review similarity scoring logic

### Grades not updating

- Run grade calculation API
- Check for null scores in submissions
- Verify database constraints

### Certificate not issuing

- Confirm final score ≥70%
- Check violation count (<3)
- Verify all exam scores recorded

## Scaling Considerations

### Current Capacity

- Supabase Free tier: ~100-200 concurrent users
- For production: Use Pro tier ($25/month)

### For Growth

1. **Database** - Consider read replicas for analytics
2. **File Storage** - Use Vercel Blob for lab code backups
3. **Real-time** - Add Supabase Realtime for notifications
4. **Caching** - Implement Redis for course content
5. **CDN** - Video content on separate CDN

### Multi-Instructor at Scale

- Partition courses by instructor
- Implement instructor dashboards
- Billing per instructor
- Usage quotas and monitoring

## Support & Maintenance

### Regular Tasks

- Monitor Supabase logs weekly
- Review plagiarism flags monthly
- Update curriculum content quarterly
- Backup database weekly
- Security patches as needed

### Monitoring

- Track daily active users
- Monitor plagiarism detection accuracy
- Watch for database query performance
- Alert on high error rates

## Future Enhancements

- [ ] Live instructor office hours with video
- [ ] Peer code review system
- [ ] Interactive code editor with auto-grading
- [ ] AI-powered code feedback
- [ ] Mobile app for course progress
- [ ] Job placement integration
- [ ] Skill badges and microCredentials
- [ ] Cohort-based learning groups

---

**Version**: 1.0
**Last Updated**: 2025
**Maintained By**: DevCourse Team
