# Setting up Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project "audiomax-440801"
3. Navigate to "IAM & Admin" > "Service Accounts"
4. Click "Create Service Account"
5. Fill in:
   - Name: maxaudio-tts
   - Description: Service account for MaxAudio TTS
   - Click "Create and Continue"
6. Add Role:
   - Search for "Cloud Text-to-Speech"
   - Select "Cloud Text-to-Speech User"
   - Click "Continue"
7. Click "Done"
8. Find your new service account in the list
9. Click the three dots (⋮) > "Manage keys"
10. Click "Add Key" > "Create new key"
11. Choose "JSON"
12. Click "Create"

The JSON file will download automatically. It should look like this:
```json
{
  "type": "service_account",
  "project_id": "audiomax-440801",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "maxaudio-tts@audiomax-440801.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

Once you have this file:
1. Save it as `google-credentials.json` in the server directory
2. Update .env.prod with:
```env
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
VOICE_API_TYPE=google
```

Important:
- Keep this file secure
- Don't commit it to git
- Add it to .gitignore

After getting the file, I can help you test the TTS integration again.
