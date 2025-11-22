"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Copy, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Shield,
  MessageSquare,
  Heart,
  BookOpen,
  Zap,
  BarChart3,
  Clock,
  User
} from "lucide-react";
import type { EvaluationResponse, ErrorResponse } from "@/lib/schema";

const STORAGE_KEY = "pitchsense_last_session";

function ScoreCard({ 
  label, 
  score, 
  icon: Icon, 
  color 
}: { 
  label: string; 
  score: number; 
  icon: any;
  color: string;
}) {
  const percentage = Math.round(score);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (percentage / 100) * circumference;
  
  // Determine color class based on score
  const getCircleColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className="relative bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-neutral-800"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`transition-all duration-1000 ease-out ${getCircleColor()}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{percentage}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-neutral-400" />
            <h4 className="text-sm font-semibold text-neutral-300">{label}</h4>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultDisplay({ result }: { result: EvaluationResponse }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-600";
  };

  const getRiskBadgeColor = (type: string) => {
    switch (type) {
      case "toxicity": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "policy": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "safety": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Score - Hero Section */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Overall Performance Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-white">{result.overallScore}</span>
              <span className="text-2xl text-neutral-500">/ 100</span>
            </div>
          </div>
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getScoreColor(result.overallScore)} flex items-center justify-center shadow-lg`}>
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(result.overallScore)} transition-all duration-1000`}
            style={{ width: `${result.overallScore}%` }}
          />
        </div>
      </div>

      {/* Individual Scores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white px-2">Performance Breakdown</h3>
        <div className="grid grid-cols-1 gap-4">
          <ScoreCard 
            label="Communication" 
            score={result.scores.communication} 
            icon={MessageSquare}
            color={getScoreColor(result.scores.communication)}
          />
          <ScoreCard 
            label="Empathy" 
            score={result.scores.empathy} 
            icon={Heart}
            color={getScoreColor(result.scores.empathy)}
          />
          <ScoreCard 
            label="Product Knowledge" 
            score={result.scores.productKnowledge} 
            icon={BookOpen}
            color={getScoreColor(result.scores.productKnowledge)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Summary</h3>
        </div>
        <p className="text-neutral-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {result.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-300 text-sm leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-900/50 border border-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Improvements</h3>
          </div>
          <ul className="space-y-3">
            {result.improvements.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-300 text-sm leading-relaxed">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Risk Flags */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
        </div>
        <div className="space-y-3">
          {result.riskFlags.map((flag, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 rounded-lg border p-4 ${getRiskBadgeColor(flag.type)}`}
            >
              {flag.type !== "none" ? (
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold mb-1 capitalize">{flag.type === "none" ? "No Risks" : flag.type}</p>
                <p className="text-sm opacity-90">{flag.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
          {result.userId && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>{result.userId}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(result.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ID: {result.sessionId.slice(0, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [userId, setUserId] = useState("");
  const [scenario, setScenario] = useState("");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<EvaluationResponse | ErrorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUserId(data.userId || "");
        setScenario(data.scenario || "");
        setTranscript(data.transcript || "");
        setResult(data.result || null);
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  useEffect(() => {
    if (result) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ userId, scenario, transcript, result })
      );
    }
  }, [result, userId, scenario, transcript]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId.trim() || null,
          scenario,
          transcript,
        }),
      });

      const data = await response.json();
      setResult(data);

      if ("error" in data) {
        toast({
          title: "Error",
          description: data.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Evaluation Complete",
          description: "Your roleplay session has been analyzed successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      toast({
        title: "Copied!",
        description: "JSON response copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isFormValid = scenario.trim() && transcript.trim();
  const isError = result && "error" in result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 relative z-10 animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                PitchSense Test
              </h1>
            </div>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
              AI-Powered Roleplay Evaluation & Analysis Platform
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Input Card */}
            <Card className="border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Session Input
                  </span>
                  <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                    Required
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="text-neutral-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User ID <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="userId"
                      placeholder="Enter user identifier"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      disabled={isLoading}
                      className="bg-neutral-800/50 border-neutral-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scenario" className="text-neutral-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Scenario <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="scenario"
                      placeholder="Describe the roleplay scenario context..."
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      disabled={isLoading}
                      required
                      rows={4}
                      className="bg-neutral-800/50 border-neutral-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                    />
                    <p className="text-xs text-neutral-500 text-right">{scenario.length} characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transcript" className="text-neutral-300 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Transcript <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="transcript"
                      placeholder="Paste the roleplay conversation transcript..."
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      disabled={isLoading}
                      required
                      rows={10}
                      className="bg-neutral-800/50 border-neutral-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-neutral-500 text-right">{transcript.length} characters</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:shadow-none h-12 text-base font-semibold"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⚡</span>
                        <span>Evaluating Session...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Evaluate Session</span>
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Result Card */}
            <Card className="border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Evaluation Result
                  </CardTitle>
                  {result && !isLoading && !isError && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="border-neutral-700 hover:bg-neutral-800 transition-all duration-200"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={resultRef}
                  className="bg-neutral-950/80 rounded-xl border border-neutral-800 p-6 min-h-[600px] max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar"
                >
                  {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                      <Skeleton className="h-32 w-full bg-neutral-800/50" />
                      <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-24 bg-neutral-800/50" />
                        <Skeleton className="h-24 bg-neutral-800/50" />
                        <Skeleton className="h-24 bg-neutral-800/50" />
                      </div>
                      <Skeleton className="h-32 w-full bg-neutral-800/50" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-48 bg-neutral-800/50" />
                        <Skeleton className="h-48 bg-neutral-800/50" />
                      </div>
                    </div>
                  ) : result && !isError ? (
                    <ResultDisplay result={result as EvaluationResponse} />
                  ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
                      <p className="text-neutral-400">{(result as ErrorResponse).error.message}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-sm">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                        <Sparkles className="w-16 h-16 opacity-30 relative z-10" />
                      </div>
                      <p className="text-lg font-medium mb-2">Ready to Evaluate</p>
                      <p className="text-sm">Submit a session to see detailed analysis results</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
}
