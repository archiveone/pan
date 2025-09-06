"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BeakerIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AIAnalysisResult } from '@/lib/types/aiAnalysis';

interface AIAnalysisViewProps {
  analysis: AIAnalysisResult;
}

export default function AIAnalysisView({ analysis }: AIAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState('sentiment');

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getScoreColor = (score: number, isReverse = false) => {
    const threshold = isReverse ? 0.3 : 0.7;
    if (score > threshold) return isReverse ? 'text-red-600' : 'text-green-600';
    if (score < (isReverse ? 0.7 : 0.3)) return isReverse ? 'text-green-600' : 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BeakerIcon className="h-5 w-5" />
          AI Analysis Results
        </CardTitle>
        <CardDescription>
          Comprehensive AI analysis of the review content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="sentiment">
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-2" />
              Sentiment
            </TabsTrigger>
            <TabsTrigger value="toxicity">
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              Toxicity
            </TabsTrigger>
            <TabsTrigger value="authenticity">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Authenticity
            </TabsTrigger>
            <TabsTrigger value="quality">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Quality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentiment" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Overall Sentiment</h4>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${getSentimentColor(analysis.sentiment.score)}`}>
                    {(analysis.sentiment.score * 100).toFixed(1)}%
                  </div>
                  <Badge>{analysis.sentiment.label}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Aspect Analysis</h4>
                <div className="space-y-2">
                  {analysis.sentiment.aspects.map((aspect, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{aspect.aspect}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={aspect.sentiment === 'positive' ? 'default' : 'destructive'}>
                          {aspect.sentiment}
                        </Badge>
                        <span className={`text-sm ${getSentimentColor(aspect.score)}`}>
                          {(aspect.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="toxicity" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Toxicity Score</h4>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.toxicity.score, true)}`}>
                    {(analysis.toxicity.score * 100).toFixed(1)}%
                  </div>
                  {analysis.toxicity.score > 0.7 && (
                    <Badge variant="destructive">High Risk</Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Category Analysis</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.toxicity.categories).map(([category, score]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{category}</span>
                        <span className={getScoreColor(score, true)}>
                          {(score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={score * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Content Flags</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.toxicity.flags).map(([flag, isActive]) =>
                    isActive ? (
                      <Badge key={flag} variant="destructive">
                        {flag.replace('_', ' ')}
                      </Badge>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authenticity" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Authenticity Score</h4>
                  <div className="flex items-center gap-2">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.authenticity.authenticityScore)}`}>
                      {(analysis.authenticity.authenticityScore * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spam Risk</span>
                      <span className={getScoreColor(analysis.authenticity.spamProbability, true)}>
                        {(analysis.authenticity.spamProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fake Review Risk</span>
                      <span className={getScoreColor(analysis.authenticity.fakeProbability, true)}>
                        {(analysis.authenticity.fakeProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bot Risk</span>
                      <span className={getScoreColor(analysis.authenticity.botProbability, true)}>
                        {(analysis.authenticity.botProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Detected Patterns</h4>
                {analysis.authenticity.patterns.duplicateContent.found && (
                  <div className="mb-2">
                    <Badge variant="destructive">Duplicate Content Detected</Badge>
                    <p className="text-sm mt-1">
                      Similarity: {(analysis.authenticity.patterns.duplicateContent.similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
                {analysis.authenticity.patterns.suspiciousPatterns.found && (
                  <div className="mb-2">
                    <Badge variant="destructive">Suspicious Patterns Detected</Badge>
                    <ul className="text-sm mt-1 list-disc list-inside">
                      {analysis.authenticity.patterns.suspiciousPatterns.patterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Overall Quality</h4>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.quality.overallScore)}`}>
                    {(analysis.quality.overallScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Quality Metrics</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.quality.metrics).map(([metric, score]) => (
                    <div key={metric} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{metric}</span>
                        <span className={getScoreColor(score)}>
                          {(score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={score * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                <div className="space-y-2">
                  {analysis.quality.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant={
                        suggestion.priority === 'high' ? 'destructive' :
                        suggestion.priority === 'medium' ? 'default' :
                        'outline'
                      }>
                        {suggestion.priority}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{suggestion.aspect}</p>
                        <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}