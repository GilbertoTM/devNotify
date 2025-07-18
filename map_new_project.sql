
-- Agregar mapeo para el nuevo proyecto
INSERT INTO repository_mappings (repository_full_name, project_id, github_webhook_url)
VALUES (
    'GilbertoTM/devNotify',
    '372cb265-a9de-4a65-b905-96f2e5068f55',
    'https://giliberto05.app.n8n.cloud/webhook/github-webhook'
) ON CONFLICT (repository_full_name) DO UPDATE SET
    project_id = EXCLUDED.project_id,
    github_webhook_url = EXCLUDED.github_webhook_url,
    updated_at = NOW();

