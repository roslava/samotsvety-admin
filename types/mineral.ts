export type EntityType = 'mineral' | 'rock' | 'gem_variety' | 'organic';
export type Lang = 'ru' | 'en';
export interface NumericRange { min: number; max: number }
export interface ScientificNotes { hardness?: string | null; composition?: string | null }
export interface Esoteric { metaphysical_properties?: string[] | null; chakras?: string[] | null; zodiac?: string[] | null; healing_interpretation?: string | null; energy_notes?: string | null; ritual_uses?: string | null }
export interface LocalizedContent { name: string; synonyms?: string[] | null; color?: string[] | null; color_description?: string | null; lore?: string | null; identification_tips?: string | null; safety_notes?: string | null; scientific_notes?: ScientificNotes | null; esoteric?: Esoteric | null }
export interface LocalityV2 { country_code: string; country_ru?: string | null; country_en?: string | null; region_ru?: string | null; region_en?: string | null; locality_ru?: string | null; locality_en?: string | null; description_ru?: string | null; description_en?: string | null; famous?: boolean | null }
export interface GalleryImageV2 { path: string; type?: string | null; caption?: { ru?: string | null; en?: string | null } | null }
export interface ImagesV2 { storage_key: string; hero?: { path: string } | null; thumbnail?: { path: string } | null; gallery?: GalleryImageV2[] | null }
export interface SourceV2 { title?: string | null; url?: string | null; author?: string | null; publisher?: string | null }
export interface ScientificV2 { chemical_formula?: string | null; hardness?: NumericRange | null; specific_gravity?: NumericRange | null; rarity?: 'common'|'uncommon'|'rare'|'very_rare'|null; base_color?: 'red'|'black'|'bi_color'|'blue'|'brown'|'green'|'yellow'|'grey'|'purple'|'white'|'pink'|'multicolor'|'orange'|null; mineral_class?: string|null; silicate_subclass?: string|null; mineral_family?: string|null; crystal_system?: 'monoclinic'|'orthorhombic'|'hexagonal'|'trigonal'|'isometric'|'triclinic'|'tetragonal'|'amorphous'|null; crystal_habit?: string[]|null; streak?: string|null; transparency?: string|null; luster?: string[]|null; tenacity?: string[]|null; fracture?: string|null; cleavage_degree?: string|null; cleavage_direction?: '1'|'2'|'3'|'4'|null; cleavage_type?: string|null; phenomena?: string[]|null; ima_status?: string|null; rock_type?: string|null }
export interface GemEntityV2WritePayload { slug: string; type: EntityType; scientific: ScientificV2; i18n: { ru: LocalizedContent; en: LocalizedContent }; localities?: LocalityV2[] | null; images?: ImagesV2 | null; related_entities?: string[] | null; sources?: SourceV2[] | null }
export interface GemEntityV2Response extends GemEntityV2WritePayload { created_at?: string; updated_at?: string }
export type Mineral = GemEntityV2Response;
export type ViewMode = 'normal' | 'esoteric';
