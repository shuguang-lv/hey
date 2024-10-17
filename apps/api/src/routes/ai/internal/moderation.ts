import lensPg from "@hey/db/lensPg";
import { generateForeverExpiry, getRedis, setRedis } from "@hey/db/redisClient";
import logger from "@hey/helpers/logger";
import type { Request, Response } from "express";
import OpenAI from "openai";
import catchedError from "src/helpers/catchedError";
import { CACHE_AGE_1_DAY } from "src/helpers/constants";
import validateIsStaff from "src/helpers/middlewares/validateIsStaff";
import validateLensAccount from "src/helpers/middlewares/validateLensAccount";
import { invalidBody, noBody } from "src/helpers/responses";
import { object, string } from "zod";

type ExtensionRequest = {
  id: string;
};

const validationSchema = object({
  id: string()
});

export const post = [
  validateLensAccount,
  validateIsStaff,
  async (req: Request, res: Response) => {
    const { body } = req;

    if (!body) {
      return noBody(res);
    }

    const validation = validationSchema.safeParse(body);

    if (!validation.success) {
      return invalidBody(res);
    }

    const { id } = body as ExtensionRequest;

    try {
      const cacheKey = `ai:moderation:${id}`;
      const cachedData = await getRedis(cacheKey);

      if (cachedData) {
        logger.info(`(cached) AI Moderation fetched for ${id}`);
        return res
          .status(200)
          .setHeader("Cache-Control", CACHE_AGE_1_DAY)
          .json({ result: JSON.parse(cachedData), success: true });
      }

      const publicationResponse = await lensPg.query(
        "SELECT content FROM publication.metadata WHERE publication_id = $1",
        [id]
      );

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: [{ type: "text", text: publicationResponse[0].content }]
      });

      const result = response.results[0];
      await setRedis(cacheKey, JSON.stringify(result), generateForeverExpiry());
      logger.info(`AI Moderation fetched for ${id}`);

      return res
        .status(200)
        .setHeader("Cache-Control", CACHE_AGE_1_DAY)
        .json({ result, success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
