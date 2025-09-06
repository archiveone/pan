export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export type ReviewFlag = {
  id: string;
  reviewId: string;
  userId: string;
  reason: ReviewFlagReason;
  details?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  updatedAt: string;
  resolution?: {
    action: 'approved' | 'rejected' | 'removed';
    moderatorId: string;
    note: string;
    timestamp: string;
  };
};

export type ReviewFlagReason =
  | 'inappropriate'
  | 'spam'
  | 'offensive'
  | 'fake'
  | 'conflict_of_interest'
  | 'other';

export interface ReviewModerationRequest {
  reviewId: string;
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
  moderatorNote?: string;
}

export interface ReviewModerationFilters {
  status?: ReviewStatus;
  flagReason?: ReviewFlagReason;
  dateRange?: {
    start: string;
    end: string;
  };
  itemType?: string;
  page?: number;
  limit?: number;
}

export interface ReviewModerationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  flagsByReason: {
    [key in ReviewFlagReason]: number;
  };
}

export interface ReviewModerationLog {
  id: string;
  reviewId: string;
  moderatorId: string;
  action: 'approve' | 'reject' | 'flag' | 'resolve_flag';
  reason?: string;
  note?: string;
  createdAt: string;
}

export interface AutoModerationRule {
  id: string;
  name: string;
  type: 'keyword' | 'pattern' | 'ai';
  config: {
    keywords?: string[];
    pattern?: string;
    aiModel?: string;
    threshold?: number;
  };
  action: 'flag' | 'reject' | 'require_review';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAIAnalysis {
  sentiment: number;
  toxicity: number;
  spam_probability: number;
  fake_probability: number;
  keywords: string[];
  language: string;
  content_flags: {
    hate_speech: boolean;
    profanity: boolean;
    personal_attack: boolean;
    sexual_content: boolean;
  };
}