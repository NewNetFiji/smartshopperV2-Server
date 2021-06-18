import { Upboat } from "../entities/Upboat";
import DataLoader from "dataloader";

// [{postId: 5, userId: 10}]
// [{postId: 5, userId: 10, value: 1}]
export const createUpboatLoader = () =>
  new DataLoader<{ productId: number; userId: number }, Upboat | null>(
    async (keys) => {
      const upboats = await Upboat.findByIds(keys as any);
      const upboatIdsToUpboat: Record<string, Upboat> = {};
      upboats.forEach((upboat) => {
        upboatIdsToUpboat[`${upboat.userId}|${upboat.productId}`] = upboat;
      });

      return keys.map(
        (key) => upboatIdsToUpboat[`${key.userId}|${key.productId}`]
      );
    }
  );