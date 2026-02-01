-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'pending');
CREATE TYPE violation_type AS ENUM ('plagiarism', 'cheating', 'policy_violation');
CREATE TYPE certificate_status AS ENUM ('pending', 'issued', 'revoked');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES users(id),
  duration_weeks INTEGER DEFAULT 12,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_modules INTEGER NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active',
  UNIQUE(student_id, course_id)
);

-- Modules/Weeks table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  video_url TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  title TEXT NOT NULL,
  description TEXT,
  total_questions INTEGER NOT NULL,
  passing_score DECIMAL(5,2) DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Questions table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  order_number INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Answers table
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id),
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labs table
CREATE TABLE labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  starter_code TEXT,
  expected_output TEXT,
  points_total INTEGER DEFAULT 100,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  exam_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passing_score DECIMAL(5,2) DEFAULT 70,
  time_limit_minutes INTEGER,
  points_total INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Questions table
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  order_number INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Answers table
CREATE TABLE exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES exam_questions(id),
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table (for quizzes, labs, exams)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  submission_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status submission_status DEFAULT 'pending',
  content TEXT NOT NULL,
  score DECIMAL(5,2),
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES users(id)
);

-- Lab Submissions table
CREATE TABLE lab_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  lab_id UUID NOT NULL REFERENCES labs(id),
  submitted_code TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status submission_status DEFAULT 'pending',
  score DECIMAL(5,2),
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES users(id)
);

-- Quiz Submissions table
CREATE TABLE quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status submission_status DEFAULT 'pending',
  score DECIMAL(5,2),
  passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Quiz Submission Answers table
CREATE TABLE quiz_submission_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_submission_id UUID NOT NULL REFERENCES quiz_submissions(id),
  question_id UUID NOT NULL REFERENCES quiz_questions(id),
  selected_answer_id UUID REFERENCES quiz_answers(id),
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2)
);

-- Exam Submissions table
CREATE TABLE exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  exam_id UUID NOT NULL REFERENCES exams(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status submission_status DEFAULT 'pending',
  score DECIMAL(5,2),
  passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Exam Submission Answers table
CREATE TABLE exam_submission_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_submission_id UUID NOT NULL REFERENCES exam_submissions(id),
  question_id UUID NOT NULL REFERENCES exam_questions(id),
  selected_answer_id UUID REFERENCES exam_answers(id),
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2)
);

-- Plagiarism Checks table
CREATE TABLE plagiarism_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES lab_submissions(id),
  similarity_score DECIMAL(5,2),
  matched_sources TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  flagged BOOLEAN DEFAULT FALSE
);

-- Violations table
CREATE TABLE violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  violation_type violation_type NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'warning',
  strike_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Grades Summary table
CREATE TABLE grades_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  lab_score DECIMAL(5,2),
  quiz_score DECIMAL(5,2),
  exam_1_score DECIMAL(5,2),
  exam_2_score DECIMAL(5,2),
  exam_3_score DECIMAL(5,2),
  exam_4_score DECIMAL(5,2),
  overall_score DECIMAL(5,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  certificate_number TEXT UNIQUE NOT NULL,
  status certificate_status DEFAULT 'pending',
  issued_at TIMESTAMP WITH TIME ZONE,
  final_score DECIMAL(5,2) NOT NULL,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX idx_labs_module_id ON labs(module_id);
CREATE INDEX idx_exams_course_id ON exams(course_id);
CREATE INDEX idx_lab_submissions_student_id ON lab_submissions(student_id);
CREATE INDEX idx_lab_submissions_lab_id ON lab_submissions(lab_id);
CREATE INDEX idx_quiz_submissions_student_id ON quiz_submissions(student_id);
CREATE INDEX idx_exam_submissions_student_id ON exam_submissions(student_id);
CREATE INDEX idx_violations_student_id ON violations(student_id);
CREATE INDEX idx_violations_course_id ON violations(course_id);
CREATE INDEX idx_grades_summary_student_id ON grades_summary(student_id);
CREATE INDEX idx_certificates_student_id ON certificates(student_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Instructors can read courses they create
CREATE POLICY "Instructors can read own courses" ON courses 
  FOR SELECT USING (auth.uid() = instructor_id);

-- Students can read courses they're enrolled in
CREATE POLICY "Students can read enrolled courses" ON courses 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.course_id = courses.id 
      AND enrollments.student_id = auth.uid()
    )
  );

-- Students can only see their own enrollments
CREATE POLICY "Students can read own enrollments" ON enrollments 
  FOR SELECT USING (auth.uid() = student_id);

-- Lab submissions policy
CREATE POLICY "Students can read own lab submissions" ON lab_submissions 
  FOR SELECT USING (auth.uid() = student_id);

-- Quiz submissions policy
CREATE POLICY "Students can read own quiz submissions" ON quiz_submissions 
  FOR SELECT USING (auth.uid() = student_id);

-- Exam submissions policy
CREATE POLICY "Students can read own exam submissions" ON exam_submissions 
  FOR SELECT USING (auth.uid() = student_id);

-- Grades summary policy
CREATE POLICY "Students can read own grades" ON grades_summary 
  FOR SELECT USING (auth.uid() = student_id);

-- Certificates policy
CREATE POLICY "Students can read own certificates" ON certificates 
  FOR SELECT USING (auth.uid() = student_id);
