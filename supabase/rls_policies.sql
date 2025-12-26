-- RLS policies for per-user isolation. Run these in Supabase SQL editor.
-- Adjust schema/table names if you already have policies in place.

-- SITES
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sites_select_own ON public.sites;
CREATE POLICY sites_select_own ON public.sites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS sites_modify_own ON public.sites;
CREATE POLICY sites_modify_own ON public.sites
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RUNS (reads only; inserts happen via service role)
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS runs_select_own ON public.runs;
CREATE POLICY runs_select_own ON public.runs
  FOR SELECT USING (auth.uid() = user_id);

-- GOOGLE INTEGRATIONS
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS google_integrations_select_own ON public.google_integrations;
CREATE POLICY google_integrations_select_own ON public.google_integrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS google_integrations_update_own ON public.google_integrations;
CREATE POLICY google_integrations_update_own ON public.google_integrations
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ANALYTICS METRICS
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS analytics_metrics_select_own ON public.analytics_metrics;
CREATE POLICY analytics_metrics_select_own ON public.analytics_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS analytics_metrics_modify_own ON public.analytics_metrics;
CREATE POLICY analytics_metrics_modify_own ON public.analytics_metrics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEARCH CONSOLE METRICS
ALTER TABLE public.search_console_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS search_console_metrics_select_own ON public.search_console_metrics;
CREATE POLICY search_console_metrics_select_own ON public.search_console_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS search_console_metrics_modify_own ON public.search_console_metrics;
CREATE POLICY search_console_metrics_modify_own ON public.search_console_metrics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ADS METRICS
ALTER TABLE public.ads_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ads_metrics_select_own ON public.ads_metrics;
CREATE POLICY ads_metrics_select_own ON public.ads_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ads_metrics_modify_own ON public.ads_metrics;
CREATE POLICY ads_metrics_modify_own ON public.ads_metrics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- COMPETITORS
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS competitors_select_own ON public.competitors;
CREATE POLICY competitors_select_own ON public.competitors
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS competitors_modify_own ON public.competitors;
CREATE POLICY competitors_modify_own ON public.competitors
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Optional: cascade clean-up
-- Ensure runs.site_id has ON DELETE CASCADE to sites.id to avoid orphan rows.
