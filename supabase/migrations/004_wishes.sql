-- Wishes table
CREATE TABLE public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  done_by UUID REFERENCES public.profiles(id),
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wishes"
  ON public.wishes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add wishes"
  ON public.wishes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their wishes"
  ON public.wishes FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their wishes"
  ON public.wishes FOR DELETE
  USING (auth.uid() = author_id);

CREATE INDEX idx_wishes_status ON public.wishes(status);
CREATE INDEX idx_wishes_created ON public.wishes(created_at DESC);
