import type { AdditionalMaterial } from "@/lib/trening/seed/additional-materials";
import { E8_COVERAGE_MATERIALS } from "@/lib/trening/seed/materials-coverage-e8";
import { MATURA_COVERAGE_MATERIALS } from "@/lib/trening/seed/materials-coverage-matura";

/** Lekcje uzupełniające luki CKE w planie nauki. */
export const COVERAGE_SEED_MATERIALS: AdditionalMaterial[] = [
  ...MATURA_COVERAGE_MATERIALS,
  ...E8_COVERAGE_MATERIALS,
];
