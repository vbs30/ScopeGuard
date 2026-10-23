-- SECURITY FIX: the ws_owner policy let owners UPDATE any column, including `plan` (self-upgrade to 'solo').
-- Owners may now change only the workspace name. Plan changes happen via service role / SQL editor / billing webhook.
revoke update on workspaces from authenticated, anon;
grant update (name) on workspaces to authenticated;
