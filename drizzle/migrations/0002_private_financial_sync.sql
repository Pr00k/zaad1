CREATE TABLE public.financial_states (
  user_id uuid PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.financial_states TO authenticated;
GRANT ALL ON public.financial_states TO service_role;
ALTER TABLE public.financial_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own financial state" ON public.financial_states FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own financial state" ON public.financial_states FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own financial state" ON public.financial_states FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE FUNCTION public.save_financial_state(expected_revision bigint, snapshot jsonb) RETURNS bigint LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE next_revision bigint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF jsonb_typeof(snapshot) <> 'object' OR NOT (snapshot ?& ARRAY['vaults','txs','goals','reminders','settings']) THEN RAISE EXCEPTION 'Invalid snapshot'; END IF;
  IF expected_revision = 0 THEN
    INSERT INTO public.financial_states(user_id, data, revision) VALUES (auth.uid(), snapshot, 1) ON CONFLICT (user_id) DO NOTHING RETURNING revision INTO next_revision;
  ELSE
    UPDATE public.financial_states SET data = snapshot, revision = revision + 1, updated_at = now() WHERE user_id = auth.uid() AND revision = expected_revision RETURNING revision INTO next_revision;
  END IF;
  RETURN COALESCE(next_revision, -1);
END;
$$;
REVOKE ALL ON FUNCTION public.save_financial_state(bigint, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_financial_state(bigint, jsonb) TO authenticated;