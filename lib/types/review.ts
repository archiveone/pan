export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  itemId: string;
  itemType: 'property' | 'service' | 'leisure';
  rating: number;
  title: string;
  content: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  helpful: number;
  response?: {
    content: string;
    createdAt: string;
    authorId: string;
    authorName: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  title: string;
  content: string;
  photos?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
  photos?: string[];
}

export interface ReviewResponse {
  content: string;
  authorId: string;
  authorName: string;
}

export interface ReviewFilters {
  rating?: number;
  sortBy?: 'recent' | 'rating' | 'helpful';
  hasPhotos?: boolean;
  hasResponse?: boolean;
  page?: number;
  limit?: number;
}