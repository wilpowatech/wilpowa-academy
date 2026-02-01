# DevCourse Platform - Deployment & Testing Guide

## Quick Start

### 1. Environment Setup

Make sure your Supabase integration is connected. Add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Database Migration

The database schema is created when the migration script runs. All tables, indexes, and RLS policies are automatically configured.

### 3. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Initial DevCourse deployment"
git push origin main

# Deploy via Vercel dashboard or CLI
vercel deploy
```

## Testing the Platform

### Test Flow - Complete 12-Week Course

#### Step 1: Sign Up as Instructor

1. Go to `/auth/signup`
2. Create account with:
   - Full Name: "John Instructor"
   - Email: `instructor@example.com`
   - Password: `SecurePass123`
   - Role: Instructor
3. Verify email (check Supabase Auth dashboard)

#### Step 2: Create Course

1. Go to `/instructor/dashboard`
2. Click "Create Course"
3. Fill in:
   - Title: "Full Stack Web Development"
   - Description: "Master JavaScript, React, Node.js, and databases"
   - Duration: 12 weeks
4. Click "Create Course"

#### Step 3: Add Course Content

1. Click "Manage Content" on the course card
2. Click "Add Module/Week"
3. For each of 12 weeks, add:
   - Week Number: 1-12
   - Title: "Week X: Topic"
   - Description: Week overview
4. For each week, add content:
   - 2-3 Lectures
   - 1-2 Labs
   - 1-2 Quizzes

#### Step 4: Create Exams

Go back to course and create 4 exams manually in Supabase:

```sql
INSERT INTO exams (course_id, exam_number, title, week_number, total_questions, passing_score, time_limit_minutes, points_total)
VALUES
  (course_id, 1, 'Exam 1: Fundamentals', 4, 10, 70, 60, 100),
  (course_id, 2, 'Exam 2: Intermediate', 8, 15, 70, 90, 150),
  (course_id, 3, 'Exam 3: Advanced', 10, 15, 70, 90, 150),
  (course_id, 4, 'Exam 4: Comprehensive', 12, 20, 70, 120, 200);
```

#### Step 5: Add Exam Questions

Use instructor exam editor:
1. Go to Instructor Module Editor
2. Navigate to Exam section
3. Add questions with multiple choice answers
4. Mark correct answers

#### Step 6: Sign Up as Student

1. Go to `/auth/signup`
2. Create student account with:
   - Full Name: "Jane Student"
   - Email: `student@example.com`
   - Password: `SecurePass123`
   - Role: Student
3. Verify email

#### Step 7: Enroll in Course

1. Go to `/student/dashboard`
2. Should see option to browse courses
3. Enroll in "Full Stack Web Development"
4. 12-week timer starts automatically

#### Step 8: Complete Course Activities

For each week:

1. **View Lectures**
   - Click course in dashboard
   - Navigate to module
   - Read/watch lectures

2. **Submit Lab**
   - Go to lab section
   - Paste code (use sample code first)
   - Submit → Plagiarism check runs
   - Can resubmit if flagged

3. **Take Quiz**
   - Click quiz in module
   - Answer questions
   - Submit for instant feedback

4. **Take Exams** (weeks 4, 8, 10, 12)
   - Go to student dashboard
   - Look for exam notifications
   - Click "Start Exam"
   - Answer all questions within time limit
   - Submit to get score

#### Step 9: Check Grades

1. Go to `/student/progress/[enrollmentId]`
2. View:
   - Overall score
   - Lab scores
   - Quiz scores
   - Individual exam scores
   - Grade breakdown

#### Step 10: Get Certificate

If overall score ≥70%:
1. Go to `/student/certificates`
2. Should see certificate card
3. Click "View Certificate" to see rendered cert
4. Click "Download PDF" to save

### Testing Plagiarism Detection

#### Test 1: Unique Code (Should Pass)

1. Student submits original lab code
2. Plagiarism check runs
3. Should show <30% similarity
4. Submission accepted

#### Test 2: Copied Code (Should Flag)

1. Student A submits lab code
2. Student B submits very similar code (>80%)
3. Both get plagiarism warnings
4. System records violation
5. Strike count increases

#### Test 3: Resubmit After Flag

1. Lab is flagged for plagiarism
2. Error message shows score
3. Student modifies code significantly
4. Resubmit after revision
5. New plagiarism check runs

### Testing Violations & Strikes

1. After 3rd violation (plagiarism, cheating, policy):
   - Student marked as ineligible for certificate
   - Can no longer submit assignments
   - Certificate cannot be issued

### Testing Multi-Instructor

1. Create second instructor account
2. Create separate course
3. Both instructors can:
   - Manage their own courses
   - Grade their students independently
   - Issue certificates separately
4. Verify data isolation (RLS policies working)

## Admin Features

### View Violations

```sql
SELECT * FROM violations 
WHERE student_id = 'student_uuid' 
AND resolved = false;
```

### Revoke Certificate

```sql
UPDATE certificates 
SET status = 'revoked' 
WHERE student_id = 'student_uuid' 
AND course_id = 'course_uuid';
```

### Reset Student Progress

```sql
DELETE FROM lab_submissions 
WHERE student_id = 'student_uuid' 
AND lab_id IN (SELECT id FROM labs WHERE module_id IN (SELECT id FROM modules WHERE course_id = 'course_uuid'));

DELETE FROM quiz_submissions 
WHERE student_id = 'student_uuid' 
AND quiz_id IN (SELECT id FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = 'course_uuid')));

DELETE FROM exam_submissions 
WHERE student_id = 'student_uuid' 
AND exam_id IN (SELECT id FROM exams WHERE course_id = 'course_uuid');
```

## Performance Testing

### Load Testing

1. Use Supabase Analytics to monitor:
   - Query performance
   - Database connections
   - RLS policy execution time

2. Monitor client performance:
   - Page load time
   - JavaScript bundle size
   - Network requests

### Database Optimization

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

-- Monitor table sizes
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Common Issues & Solutions

### Issue: RLS Policies Blocking Access

**Solution:**
- Check user `auth.uid()` matches user table ID
- Verify auth user is properly set
- Check policy conditions

### Issue: Plagiarism Check Not Working

**Solution:**
- Verify code normalization working correctly
- Check similarity algorithm
- View plagiarism_checks table entries

### Issue: Certificate Not Generating

**Solution:**
- Check grade ≥ 70%
- Verify violation count < 3
- Ensure all exams have scores
- Check certificate eligibility function

### Issue: Slow Exam Loading

**Solution:**
- Add index on exam_questions.exam_id
- Cache questions in Redis
- Pre-load answers with questions

### Issue: Student Sees Other Student's Work

**Solution:**
- Verify lab_submissions RLS policy
- Check quiz_submissions RLS policy
- Ensure student_id filter in all queries

## Monitoring & Logs

### Vercel Analytics

```
Dashboard → Analytics → Real-Time Events
```

Check:
- 200 responses (success)
- 4xx responses (client errors)
- 5xx responses (server errors)

### Supabase Logs

```
Dashboard → Logs → API Requests
```

Monitor:
- Auth failures
- Query performance
- RLS violations
- Slow operations

### Error Tracking

Enable error tracking:
```typescript
// Use Vercel's native error logging
console.error("[v0] Error context:", errorDetails)
```

## Backup & Recovery

### Daily Backup

Supabase automatically backs up daily. To restore:

1. Go to Supabase Dashboard
2. Settings → Backups
3. Select backup date
4. Click Restore

### Manual Database Export

```bash
pg_dump postgres://user:password@host/database > backup.sql
```

## Next Steps

1. **Configure Email** - Set up transactional emails for notifications
2. **Add Video** - Integrate Vercel Blob or Cloudinary for lecture videos
3. **Scale Database** - Move to Supabase Pro ($25/mo) for production
4. **Setup CDN** - Use Vercel Edge for API route caching
5. **Analytics** - Add PostHog for user behavior tracking
6. **Payment** - Integrate Stripe for course fees
7. **SSO** - Add GitHub/Google login for faster enrollment

## Support

For issues or questions:
1. Check logs in Vercel & Supabase dashboards
2. Review error messages in console
3. Consult SETUP_GUIDE.md for architecture details
4. Contact support if critical issues persist
