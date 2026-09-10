import type { MineralFormData } from './validations/mineral.ts';
import type { GemEntityV2Response, GemEntityV2WritePayload } from '../types/mineral';

export function toV2WritePayload(entity: GemEntityV2Response | MineralFormData): GemEntityV2WritePayload {
  const write = { ...entity } as Partial<GemEntityV2Response>;
  delete write.created_at;
  delete write.updated_at;
  return write as GemEntityV2WritePayload;
}
