INSERT IGNORE INTO business_settings (setting_key, setting_value, description) VALUES
('google_oauth_client_id', '"YOUR_GOOGLE_CLIENT_ID"', 'Google OAuth Client ID'),
('google_oauth_client_secret', '"YOUR_GOOGLE_CLIENT_SECRET"', 'Google OAuth Client Secret'),
('google_oauth_redirect_urls', '"http://localhost:3000/api/auth/google/callback"', 'Google OAuth Callback URL'),
('google_oauth_status', '"enabled"', 'Google OAuth Status'),
('google_oauth_mode', '"production"', 'Google OAuth Mode'),
('business_name', '"HHC Laser & Co MedSpa"', 'Business Name'),
('business_email', '"infohhcLaser@gmail.com"', 'Business Email'),
('business_phone_1', '"(876) 319-6241"', 'Primary Phone'),
('business_phone_2', '"(876) 631-8134"', 'Secondary Phone');
