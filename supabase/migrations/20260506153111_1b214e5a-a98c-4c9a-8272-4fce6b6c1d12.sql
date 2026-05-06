-- Remove 'احياء' from video_category enum
-- First delete any videos using this category (should be none, just added)
DELETE FROM public.videos WHERE category = 'احياء';

-- Rename old enum, create new without 'احياء', migrate column, drop old
ALTER TYPE public.video_category RENAME TO video_category_old;

CREATE TYPE public.video_category AS ENUM (
  'عربي', 'English', 'علوم حياتية', 'كيمياء', 'رياضيات', 'مالية',
  'فيزياء', 'وطنيه', 'علوم الارض', 'دين', 'تاريخ', 'حاسوب', 'جغرافيه', 'مهني'
);

ALTER TABLE public.videos ALTER COLUMN category DROP DEFAULT;
ALTER TABLE public.videos
  ALTER COLUMN category TYPE public.video_category
  USING category::text::public.video_category;
ALTER TABLE public.videos ALTER COLUMN category SET DEFAULT 'عربي'::public.video_category;

DROP TYPE public.video_category_old;