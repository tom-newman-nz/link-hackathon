"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, Bot, CheckCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  type: string;
}

interface AIQuestion {
  id: string;
  question: string;
  type: string;
}

interface CourseRecommendation {
  code: string;
  title: string;
  description: string;
  units: number;
  department: string;
  professor: string;
  rmp_rating: number;
  matching_reviews: string[];
  grade_distribution: any;
  requirements_fulfilled: string[];
}

export default function EnrolmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<(Question | AIQuestion)[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'initial' | 'ai' | 'recommendations'>('initial');
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/enrollment');
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }
      const data = await response.json();
      setQuestions(data.questions);
      setAllQuestions(data.questions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load enrollment questions');
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string | number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId.toString()]: answer
    }));
  };

  const handleNext = async () => {
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit current phase
      await submitCurrentPhase();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitCurrentPhase = async () => {
    setIsSubmitting(true);
    try {
      if (phase === 'initial') {
        // Submit initial questions and get AI questions
        const response = await fetch('/api/enrollment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responses: Object.entries(answers).map(([id, answer]) => ({
              question_id: id,
              answer: answer
            }))
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit initial questions');
        }

        const data = await response.json();
        setAiQuestions(data.ai_questions);
        setAllQuestions([...questions, ...data.ai_questions]);
        setPhase('ai');
        setCurrentStep(questions.length); // Start at first AI question
      } else if (phase === 'ai') {
        // Submit AI questions and get recommendations
        const response = await fetch('/api/enrollment/ai-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responses: Object.entries(answers).map(([id, answer]) => ({
              question_id: id,
              answer: answer
            }))
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit AI questions');
        }

        const data = await response.json();
        setRecommendations(data.recommendations.recommendations || []);
        setPhase('recommendations');
      }
    } catch (error) {
      console.error('Error submitting questions:', error);
      setError('Failed to submit questions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question | AIQuestion) => {
    const isAIQuestion = 'id' in question && typeof question.id === 'string';
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            {isAIQuestion ? (
              <>
                <Bot className="h-5 w-5 text-blue-600" />
                <Badge variant="secondary">AI-Powered Question</Badge>
              </>
            ) : (
              <>
                <GraduationCap className="h-5 w-5 text-green-600" />
                <Badge variant="outline">Initial Question</Badge>
              </>
            )}
          </div>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === 'multiple_choice' && 'options' in question && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={answers[question.id] === option ? "default" : "outline"}
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => handleAnswer(question.id, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          {question.type === 'text' && (
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRecommendations = () => {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle className="text-2xl">Your Personalized Course Recommendations</CardTitle>
            </div>
            <CardDescription>
              Based on your preferences and AI analysis, here are the best courses for you
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {recommendations.map((course, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{course.code}: {course.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {course.department} • {course.units} units • Prof. {course.professor}
                    </CardDescription>
                  </div>
                  {course.rmp_rating && (
                    <Badge variant="secondary">
                      ⭐ {course.rmp_rating}/5.0 RMP
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{course.description}</p>
                
                {course.matching_reviews && course.matching_reviews.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Why this course matches you:</h4>
                    <ul className="space-y-1">
                      {course.matching_reviews.map((review, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {review}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {course.requirements_fulfilled && course.requirements_fulfilled.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements fulfilled:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.requirements_fulfilled.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full">
                  Enroll in {course.code}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading enrollment questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadQuestions}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (phase === 'recommendations') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {renderRecommendations()}
        </div>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentStep];
  const progress = ((currentStep + 1) / allQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Enrollment</h1>
          <p className="text-gray-600">AI-powered course recommendations based on your preferences</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {allQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          {currentQuestion && renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion?.id] || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : currentStep === allQuestions.length - 1 ? (
              'Get Recommendations'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 