import lensPg from "@hey/db/lensPg";
import prisma from "@hey/db/prisma/db/client";
import logger from "@hey/helpers/logger";
import type { Request, Response } from "express";
import catchedError from "src/helpers/catchedError";
import { rateLimiter } from "src/helpers/middlewares/rateLimiter";
import { noBody } from "src/helpers/responses";

export const get = [
  rateLimiter({ requests: 500, within: 1 }),
  async (req: Request, res: Response) => {
    const { id, page = 1, size = 50 } = req.query;

    if (!id) {
      return noBody(res);
    }

    try {
      const list = await prisma.list.findUnique({
        select: { profiles: { select: { profileId: true } } },
        where: { id: id as string }
      });

      if (!list?.profiles.length) {
        return res.status(200).json({ result: [], success: true });
      }

      const accounts = list.profiles.map((account) => account.profileId);
      const accountsList = accounts.map((p) => `'${p}'`).join(",");

      // Calculate the offset for pagination
      const offset =
        (Number.parseInt(page as string) - 1) * Number.parseInt(size as string);

      const posts = await lensPg.query(
        `
          SELECT publication_id AS id
          FROM publication_view
          WHERE profile_id IN (${accountsList})
          AND publication_type IN ('POST', 'MIRROR')
          AND is_hidden = false
          ORDER BY timestamp DESC
          LIMIT $1 OFFSET $2
        `,
        [size, offset]
      );

      logger.info(`List posts fetched for ${id}, page ${page}, size ${size}`);

      return res.status(200).json({
        result: posts.map((row) => row.id),
        size,
        offset,
        success: true
      });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];