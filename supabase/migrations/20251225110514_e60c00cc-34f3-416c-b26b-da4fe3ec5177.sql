-- Schedule keep-alive ping every 3 days at midnight UTC
SELECT cron.schedule(
  'keep-alive-ping',
  '0 0 */3 * *',
  $$
  SELECT
    net.http_post(
      url:='https://eumfdxgcqenpptjytqmc.supabase.co/functions/v1/keep-alive',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bWZkeGdjcWVucHB0anl0cW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDU2OTMsImV4cCI6MjA3NDM4MTY5M30.6Gct9fFUj0DBG4c2-AFmyIr_8tfjnX4KfpqCZgQ1Hk8"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);