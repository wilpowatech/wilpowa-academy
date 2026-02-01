# DevCourse Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Environment Variables (1 min)

Add to your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=paste_your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_key
```

### Step 2: Deploy (2 min)

```bash
# Push to GitHub
git push origin main

# Deploy to Vercel (or use Vercel dashboard)
vercel deploy
```

The database schema is created automatically on first deploy.

### Step 3: Test Account (1 min)

Visit your deployed URL and:

**As Instructor:**
- Sign up: `instructor@example.com` / `Password123`
- Role: Instructor
- Create test course

**As Student:**
- Sign up: `student@example.com` / `Password123`
- Role: Student
- Enroll in course

### Step 4: Verify Features (1 min)

✅ **Login works** - Can sign in with both accounts
✅ **12-week timer** - Countdown appears on student dashboard
✅ **Add content** - Instructor can add lectures/labs
✅ **Lab submission** - Student can submit code
✅ **Plagiarism check** - Automatic similarity detection
✅ **Grading** - Progress shows updated scores
✅ **Certificate** - Shows when grade ≥ 70%

## 📚 Next Steps

### For Production Use:

1. **Add More Courses**
   - Instructor Dashboard → Create Course
   - Add 12 weeks of content
   - Create 4 exams

2. **Invite Students**
   - Share signup link: `your-domain.com/auth/signup`
   - Students enroll in courses
   - 12-week timer starts automatically

3. **Monitor Progress**
   - Instructor Dashboard → Analytics
   - View student grades in real-time
   - Manage plagiarism violations

4. **Generate Certificates**
   - After week 12, check student progress
   - Certificates auto-generate if ≥70%
   - Students download from certificate page

### For Customization:

| Want to change... | File to edit |
|-----------------|------------|
| Colors/styling | `/app/globals.css` + components |
| Course title | `/app/page.tsx` |
| Grading weights | `/lib/grading.ts` |
| Plagiarism threshold | `/lib/plagiarism.ts` |
| Email templates | Supabase dashboard |

## 🔐 Security Checklist

- [ ] Supabase service role key in env (never in code)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Row Level Security active (automatic)
- [ ] Regular backups enabled (Supabase)
- [ ] Admin emails configured

## ⚡ Performance Tips

1. **Cache courses** - Students load same content
2. **Optimize images** - Use Next.js Image component
3. **Database indexes** - Already added (in schema)
4. **Monitor queries** - Supabase → Analytics
5. **Use Vercel Edge** - For API route caching

## 🐛 Troubleshooting

### "Supabase not connected"
- Check env variables in Vercel Settings
- Redeploy after adding variables
- Restart local dev server

### "Plagiarism check failing"
- Verify all code fields have data
- Check plagiarism_checks table for errors
- Review normalization function

### "Grades not updating"
- Run POST /api/grade manually
- Check for null scores in submissions
- Verify exam question points

### "Certificate not generating"
- Confirm final score ≥ 70%
- Check violation count < 3
- Verify all exams have scores

## 📞 Support

| Issue | Solution |
|-------|----------|
| Login not working | Check Supabase auth email settings |
| Database errors | Check RLS policies in Supabase |
| Slow performance | Check database query metrics |
| Data not saving | Verify form submission handling |

## 🎯 Success Metrics

Monitor these to track adoption:

```
Daily Active Users (DAU)
- Supabase → Analytics → API Requests

Course Completion Rate
- Completed ÷ Enrolled

Average Grade
- SELECT AVG(overall_score) FROM grades_summary

Plagiarism Detection Rate
- Flagged submissions ÷ Total submissions

Certificate Issuance Rate
- Certificates issued ÷ Completed courses
```

## 🔗 Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation**: See `/SETUP_GUIDE.md`
- **User Flows**: See `/USER_FLOWS.md`
- **API Reference**: See code comments in `/app/api`

## 💡 Pro Tips

1. **Test plagiarism**: Submit same code twice to see similarity detection
2. **Check grades**: Go to `/student/progress/[enrollmentId]` for full breakdown
3. **Monitor violations**: Query `violations` table in Supabase
4. **Backup data**: Use Supabase → Backups for daily backups
5. **Scale up**: Move to Supabase Pro ($25/mo) when hitting 500+ users

## 📝 Common Customizations

### Change Primary Color

**In `/app/globals.css`:**
```css
--primary-blue: #2563eb; /* Change this hex color */
```

### Adjust Grading Weights

**In `/lib/grading.ts`:**
```typescript
export const DEFAULT_WEIGHTS = {
  labWeight: 0.50,      // Increase to 50%
  quizWeight: 0.25,     // Decrease to 25%
  examWeight: 0.25,     // Keep at 25%
}
```

### Change Plagiarism Threshold

**In `/lib/plagiarism.ts`:**
```typescript
const PLAGIARISM_THRESHOLD = 0.70; // Flag if >70% similar
// Change to 0.80 for 80% threshold
```

### Add More Exams

Modify the schema to create more exam periods:

```sql
INSERT INTO exams (course_id, exam_number, week_number, title)
VALUES (course_id, 5, 16, 'Bonus Exam');
```

## 🎓 Course Creation Template

Use this structure for new courses:

```
Week 1-3:  Fundamentals
- Lecture 1: Introduction
- Lecture 2: Setup
- Lab 1: Hello World
- Quiz: 5 questions
↓
Week 4: EXAM 1 (10 questions, 60 min)
↓
Week 5-7:  Core Concepts
- Lecture 3: Advanced Topic
- Lecture 4: Patterns
- Lab 2: Project
- Lab 3: Capstone
↓
Week 8: EXAM 2 (15 questions, 90 min)
↓
Week 9-11: Advanced Topics
- Lecture 5: Optimization
- Lab 4: Performance
↓
Week 12: EXAM 3 & 4 + Final Projects
```

## ✅ Final Checklist Before Going Live

- [ ] Custom domain connected
- [ ] Supabase backups enabled
- [ ] Email templates customized
- [ ] Course content created
- [ ] Test student account verified
- [ ] Certificate verified
- [ ] Plagiarism detection tested
- [ ] Grading calculated correctly
- [ ] Support email configured
- [ ] Analytics dashboard set up

## 🚀 Launch!

You're ready to launch! 

1. Share the signup link with students
2. Instructor adds courses and content
3. Students enroll and start learning
4. Monitor progress and analytics
5. Issue certificates upon completion

**Questions?** Check SETUP_GUIDE.md or DEPLOYMENT.md for detailed documentation.

---

**Happy teaching! 🎓**
