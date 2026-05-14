export interface ReviewUserRef {
  _id: string;
  name?: string;
  email?: string;
}

export interface ReviewDTO {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  /** ObjectId string when unpopulated; populated object from backend `populate("user")` */
  user?: string | ReviewUserRef;
}

export interface CafeReviewsResponse {
  status: string;
  data: ReviewDTO[];
}
