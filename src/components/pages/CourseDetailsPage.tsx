import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import { CheckCircle, Clock, GraduationCap, ListChecks, ArrowRight, BookOpen, Users, Award, ChevronRight } from 'lucide-react';

interface CourseDetailsPageProps {
  courseId: string;
  onPageChange: (page: string) => void;
}

const COURSE_LIBRARY: Record<string, {
  title: string;
  subtitle: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  overview: string;
  highlights: string[];
  syllabus: Array<{ title: string; items: string[] }>;
  outcomes: string[];
}> = {
  'tourist-visa-fundamentals': {
    title: 'Tourist Visa Fundamentals',
    subtitle: 'Step-by-step guidance to successfully obtain a tourist visa',
    duration: '2 weeks',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1721138942121-a26751b520b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    overview: 'Learn the end-to-end process of applying for a tourist visa with confidence. This course covers documentation, timelines, interview tips, and real-world best practices to minimize rejections.',
    highlights: [
      'Document checklist and templates',
      'Application walkthroughs for popular destinations',
      'Interview preparation and common questions',
      'Avoiding frequent mistakes that cause delays',
    ],
    syllabus: [
      { title: 'Module 1 • Visa Basics', items: ['Visa categories overview', 'Eligibility and intent', 'Understanding consular requirements'] },
      { title: 'Module 2 • Documentation', items: ['Financial proofs', 'Itinerary & travel insurance', 'Purpose of travel letter'] },
      { title: 'Module 3 • Application', items: ['Country-specific portals', 'Biometrics & appointment booking', 'Processing timelines'] },
      { title: 'Module 4 • Interview & Decision', items: ['Interview etiquette and tips', 'Addressing prior refusals', 'Next steps after decisions'] },
    ],
    outcomes: [
      'Confidently assemble a complete application file',
      'Understand interview expectations and responses',
      'Reduce processing delays with correct submissions',
    ],
  },
  'student-visa-mastery': {
    title: 'Student Visa Mastery',
    subtitle: 'From university selection to post-study options',
    duration: '4 weeks',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1558409816-5370d92f4bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    overview: 'A comprehensive path for aspiring international students. Learn how to craft a strong application, meet financial/academic requirements, and prepare for life abroad.',
    highlights: [
      'University and program strategy',
      'SOP and recommendation frameworks',
      'Funding, scholarships, and GTE (where applicable)',
      'Compliance and post-study work routes',
    ],
    syllabus: [
      { title: 'Module 1 • Strategy', items: ['Shortlist right-fit universities', 'Intake timelines', 'Country-specific nuances'] },
      { title: 'Module 2 • Application Materials', items: ['SOP structure and samples', 'Recommendation letters', 'Academic and language proofs'] },
      { title: 'Module 3 • Financials & Visa', items: ['Funding plans and proofs', 'CAS/i20 and COE processes', 'Interview/VO preparation'] },
      { title: 'Module 4 • After You Arrive', items: ['Compliance and reporting', 'Internships and work rights', 'Post-study work options'] },
    ],
    outcomes: [
      'Build a strong, credible student profile',
      'Optimize admissions chances and timelines',
      'Navigate visa interviews and compliance successfully',
    ],
  },
  'immigration-law-basics': {
    title: 'Immigration Law Basics',
    subtitle: 'Foundational principles of immigration frameworks and processes',
    duration: '6 weeks',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1666790676906-0295230c121d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
    overview: 'Understand the legal foundations, rights and obligations, appeals, and evolving policy landscape across key jurisdictions.',
    highlights: [
      'Legal theory to practical application',
      'Case studies and mock assessments',
      'Ethical practice and client advisory',
      'Tracking policy updates effectively',
    ],
    syllabus: [
      { title: 'Module 1 • Legal Foundations', items: ['Sources of law', 'Key definitions and doctrines', 'Jurisdiction and admissibility'] },
      { title: 'Module 2 • Procedures', items: ['Applications and evidence', 'Administrative fairness', 'Appeals and judicial review'] },
      { title: 'Module 3 • Practice', items: ['Professional conduct', 'Risk and compliance', 'Client case management'] },
      { title: 'Module 4 • Policy & Trends', items: ['Monitoring changes', 'Impact analysis', 'Adapting strategies'] },
    ],
    outcomes: [
      'Interpret and apply legal requirements confidently',
      'Prepare defensible submissions and appeals',
      'Develop an ethical, client-focused practice mindset',
    ],
  },
};

function toTitle(id: string) {
  return (COURSE_LIBRARY[id]?.title) || id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export function CourseDetailsPage({ courseId, onPageChange }: CourseDetailsPageProps) {
  const course = COURSE_LIBRARY[courseId];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/5 via-background to-transparent">
        <div className="site-container site-max">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <GraduationCap className="w-4 h-4 mr-2" />
                Learning Outline
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                {course?.title || toTitle(courseId)}
              </h1>
              <p className="text-lg text-muted-foreground">
                {course?.subtitle || 'Explore the full course outline, schedule, and outcomes.'}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />{course?.duration || 'Self-paced'}</div>
                <div className="flex items-center"><ListChecks className="w-4 h-4 mr-2" />{course?.level || 'All Levels'}</div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button size="lg" onClick={() => onPageChange('visaed')}>
                  Enroll Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => onPageChange('visaed')}>
                  Browse All Courses
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden rounded-3xl ring-1 ring-border/50">
              <ImageWithFallback
                src={course?.image || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1080&auto=format&fit=crop'}
                alt={course?.title || toTitle(courseId)}
                className="w-full h-72 object-cover"
              />
            </Card>
          </div>
        </div>
      </section>

      {/* Highlights */}
      {course && (
        <section className="py-16 md:py-20">
          <div className="site-container site-max grid md:grid-cols-3 gap-6">
            {course.highlights.map((h, i) => (
              <Card key={i} className="rounded-2xl ring-1 ring-border/50 h-full">
                <CardContent className="p-6 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div className="text-sm text-muted-foreground">{h}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Syllabus */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="site-container site-max">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Course Syllabus</h2>
            <p className="text-muted-foreground">A structured learning path with practical outcomes</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {(course?.syllabus || [
              { title: 'Module 1 • Overview', items: ['Introduction', 'Scope', 'Methodology'] },
              { title: 'Module 2 • Practical', items: ['Workshop', 'Templates', 'Checklist'] },
            ]).map((mod, i) => (
              <Card key={i} className="rounded-2xl ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><BookOpen className="w-4 h-4 mr-2" />{mod.title}</CardTitle>
                  <CardDescription>What you will cover</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <ul className="space-y-2">
                    {mod.items.map((item, j) => (
                      <li key={j} className="flex items-start text-sm text-muted-foreground">
                        <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes and Who it's for */}
      <section className="py-16 md:py-20">
        <div className="site-container site-max grid lg:grid-cols-2 gap-8">
          <Card className="rounded-2xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Award className="w-5 h-5 mr-2" />Key Outcomes</CardTitle>
              <CardDescription>What you will be able to do after this course</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <ul className="space-y-2">
                {(course?.outcomes || ['Apply the knowledge in real scenarios', 'Reduce errors and rework', 'Confidently plan next steps']).map((o, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mt-0.5 mr-2 text-green-600" />{o}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Users className="w-5 h-5 mr-2" />Who This Is For</CardTitle>
              <CardDescription>Ideal learner profiles</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6 text-sm text-muted-foreground space-y-2">
              <div>• Applicants preparing their first submission</div>
              <div>• Students and professionals seeking clarity</div>
              <div>• Advisors who want a structured refresher</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="site-container site-max text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to start learning?</h3>
          <p className="text-muted-foreground mb-6">Join thousands of learners who improved their approval outcomes with VisaEd.</p>
          <Button size="lg" onClick={() => onPageChange('visaed')}>
            Enroll Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
