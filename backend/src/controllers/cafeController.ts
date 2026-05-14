import { Request, Response } from "express";
import mongoose from "mongoose";
import { Cafe } from "../models/Cafe";
import { NotFoundError, ValidationError } from "../utils/errors";

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

export async function createCafe(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;

  for (const field of ["name", "description", "address"] as const) {
    const val = body[field] as Record<string, unknown> | undefined;
    if (!val || typeof val !== "object") {
      throw new ValidationError(`Missing required field: "${field}"`);
    }
    if (typeof val.ja !== "string" || val.ja.trim() === "") {
      throw new ValidationError(`"${field}.ja" must be a non-empty string`);
    }
    if (typeof val.vi !== "string" || val.vi.trim() === "") {
      throw new ValidationError(`"${field}.vi" must be a non-empty string`);
    }
  }

  if (typeof body.district !== "string" || body.district.trim() === "") {
    throw new ValidationError('"district" must be a non-empty string');
  }

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  const oh = body.openingHours as Record<string, unknown> | undefined;
  if (!oh || typeof oh !== "object") {
    throw new ValidationError('Missing required field: "openingHours"');
  }
  if (typeof oh.open !== "string" || !timeRegex.test(oh.open)) {
    throw new ValidationError('"openingHours.open" must be a valid HH:mm string');
  }
  if (typeof oh.close !== "string" || !timeRegex.test(oh.close)) {
    throw new ValidationError('"openingHours.close" must be a valid HH:mm string');
  }

  const VALID_HASHTAGS = [
    "wifi",
    "outlets",
    "quiet",
    "japanese",
    "noTimeLimit",
  ] as const;
  type Hashtag = (typeof VALID_HASHTAGS)[number];

  if (body.hashtags !== undefined) {
    if (!Array.isArray(body.hashtags)) {
      throw new ValidationError('"hashtags" must be an array');
    }
    for (const tag of body.hashtags as unknown[]) {
      if (!VALID_HASHTAGS.includes(tag as Hashtag)) {
        throw new ValidationError(
          `Invalid hashtag "${String(tag)}". Allowed: ${VALID_HASHTAGS.join(", ")}`
        );
      }
    }
  }

  if (body.location !== undefined) {
    const loc = body.location as Record<string, unknown>;
    if (loc.coordinates !== undefined) {
      const coords = loc.coordinates;
      if (
        !Array.isArray(coords) ||
        coords.length !== 2 ||
        typeof coords[0] !== "number" ||
        typeof coords[1] !== "number"
      ) {
        throw new ValidationError(
          '"location.coordinates" must be an array of two numbers [longitude, latitude]'
        );
      }
      const lng = coords[0] as number;
      const lat = coords[1] as number;
      if (lng < -180 || lng > 180) {
        throw new ValidationError(
          '"location.coordinates[0]" (longitude) must be between -180 and 180'
        );
      }
      if (lat < -90 || lat > 90) {
        throw new ValidationError(
          '"location.coordinates[1]" (latitude) must be between -90 and 90'
        );
      }
    }
  }

  if (body.menu !== undefined) {
    if (!Array.isArray(body.menu)) {
      throw new ValidationError('"menu" must be an array');
    }
    (body.menu as unknown[]).forEach((item, i) => {
      if (typeof item !== "object" || item === null) {
        throw new ValidationError(`"menu[${i}]" must be an object`);
      }
      const menuItem = item as Record<string, unknown>;
      if (typeof menuItem.name !== "string" || menuItem.name.trim() === "") {
        throw new ValidationError(`"menu[${i}].name" must be a non-empty string`);
      }
      if (typeof menuItem.price !== "number") {
        throw new ValidationError(`"menu[${i}].price" must be a number`);
      }
    });
  }

  const cafe = await Cafe.create(req.body);
  res.status(201).json({ status: "success", data: cafe });
}

export async function updateCafe(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError("Invalid cafe id");
  }

  const body = req.body as Record<string, unknown>;

  // Strip immutable fields silently — clients should not be blocked for sending them
  const IMMUTABLE_FIELDS = [
    "_id",
    "averageRating",
    "reviewCount",
    "createdAt",
    "updatedAt",
  ] as const;
  for (const field of IMMUTABLE_FIELDS) {
    delete body[field];
  }

  // Validate bilingual fields when present — only check subfields that are provided
  for (const field of ["name", "description", "address"] as const) {
    if (body[field] !== undefined) {
      const val = body[field] as Record<string, unknown>;
      if (typeof val !== "object" || val === null) {
        throw new ValidationError(`"${field}" must be an object`);
      }
      if (val.ja !== undefined && (typeof val.ja !== "string" || val.ja.trim() === "")) {
        throw new ValidationError(`"${field}.ja" must be a non-empty string`);
      }
      if (val.vi !== undefined && (typeof val.vi !== "string" || val.vi.trim() === "")) {
        throw new ValidationError(`"${field}.vi" must be a non-empty string`);
      }
    }
  }

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (body.openingHours !== undefined) {
    const oh = body.openingHours as Record<string, unknown>;
    if (typeof oh !== "object" || oh === null) {
      throw new ValidationError('"openingHours" must be an object');
    }
    if (oh.open !== undefined && (typeof oh.open !== "string" || !timeRegex.test(oh.open))) {
      throw new ValidationError('"openingHours.open" must be a valid HH:mm string');
    }
    if (oh.close !== undefined && (typeof oh.close !== "string" || !timeRegex.test(oh.close))) {
      throw new ValidationError('"openingHours.close" must be a valid HH:mm string');
    }
  }

  const VALID_HASHTAGS = [
    "wifi",
    "outlets",
    "quiet",
    "japanese",
    "noTimeLimit",
  ] as const;
  type Hashtag = (typeof VALID_HASHTAGS)[number];

  if (body.hashtags !== undefined) {
    if (!Array.isArray(body.hashtags)) {
      throw new ValidationError('"hashtags" must be an array');
    }
    for (const tag of body.hashtags as unknown[]) {
      if (!VALID_HASHTAGS.includes(tag as Hashtag)) {
        throw new ValidationError(
          `Invalid hashtag "${String(tag)}". Allowed: ${VALID_HASHTAGS.join(", ")}`
        );
      }
    }
  }

  if (body.location !== undefined) {
    const loc = body.location as Record<string, unknown>;
    if (loc.coordinates !== undefined) {
      const coords = loc.coordinates;
      if (
        !Array.isArray(coords) ||
        coords.length !== 2 ||
        typeof coords[0] !== "number" ||
        typeof coords[1] !== "number"
      ) {
        throw new ValidationError(
          '"location.coordinates" must be an array of two numbers [longitude, latitude]'
        );
      }
      const lng = coords[0] as number;
      const lat = coords[1] as number;
      if (lng < -180 || lng > 180) {
        throw new ValidationError(
          '"location.coordinates[0]" (longitude) must be between -180 and 180'
        );
      }
      if (lat < -90 || lat > 90) {
        throw new ValidationError(
          '"location.coordinates[1]" (latitude) must be between -90 and 90'
        );
      }
    }
  }

  if (body.menu !== undefined) {
    if (!Array.isArray(body.menu)) {
      throw new ValidationError('"menu" must be an array');
    }
    (body.menu as unknown[]).forEach((item, i) => {
      if (typeof item !== "object" || item === null) {
        throw new ValidationError(`"menu[${i}]" must be an object`);
      }
      const menuItem = item as Record<string, unknown>;
      if (typeof menuItem.name !== "string" || menuItem.name.trim() === "") {
        throw new ValidationError(`"menu[${i}].name" must be a non-empty string`);
      }
      if (typeof menuItem.price !== "number") {
        throw new ValidationError(`"menu[${i}].price" must be a number`);
      }
    });
  }

  const cafe = await Cafe.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!cafe) {
    throw new NotFoundError(`Cafe not found: ${id}`);
  }

  res.json({ status: "success", data: cafe });
}

export async function deleteCafe(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError("Invalid cafe id");
  }

  const cafe = await Cafe.findByIdAndDelete(id);

  if (!cafe) {
    throw new NotFoundError(`Cafe not found: ${id}`);
  }

  res.status(204).send();
}
