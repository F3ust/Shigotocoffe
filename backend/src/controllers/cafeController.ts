import { Request, Response } from "express";
import { Cafe } from "../models/Cafe";
import { NotFoundError } from "../utils/errors";

interface CafeQueryParams {
  q?: string;
  district?: string;
  minRating?: string;
  tags?: string;
  page?: string;
  limit?: string;
}

export async function getCafes(req: Request, res: Response): Promise<void> {
  const {
    q,
    district,
    minRating,
    tags,
    page = "1",
    limit = "12",
  } = req.query as CafeQueryParams;

  const filter: Record<string, unknown> = {};

  // Text search: case-insensitive regex across bilingual fields
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { "name.ja": regex },
      { "name.vi": regex },
      { "description.ja": regex },
      { "description.vi": regex },
    ];
  }

  if (district) {
    filter.district = district;
  }

  if (minRating) {
    filter.averageRating = { $gte: parseFloat(minRating) };
  }

  // Tags filter: comma-separated, all must be present
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    filter.hashtags = { $all: tagList };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [cafes, total] = await Promise.all([
    Cafe.find(filter)
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Cafe.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    data: cafes,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getCafeById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cafe = await Cafe.findById(id).lean();

  if (!cafe) {
    throw new NotFoundError(`Cafe not found: ${id}`);
  }

  res.json({
    status: "success",
    data: cafe,
  });
}
