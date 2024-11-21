console.log(`
IMPORTANT: The service account needs specific setup steps:

1. First, enable the Cloud Text-to-Speech API:
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Select project: audiomax-440801
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Text-to-Speech API"
   - Click "ENABLE" if not already enabled

2. Then, set up the service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Find: text-to-speech-service-577@audiomax-440801.iam.gserviceaccount.com
   - Click on the service account
   - Go to "PERMISSIONS" tab
   - Click "GRANT ACCESS"
   - Add these roles:
     * "Cloud Text-to-Speech API User"
     * "Service Account Token Creator"

3. Enable the service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Find your service account
   - If the account is disabled, click the three dots (actions menu)
   - Select "Enable service account"

4. Create a new key:
   - Go to the "KEYS" tab
   - Click "ADD KEY" > "Create new key"
   - Choose JSON format
   - Click "CREATE"

The service account must be:
1. Enabled
2. Have the correct API enabled (Cloud Text-to-Speech API)
3. Have the necessary roles assigned
4. Have a valid key

After completing these steps, save the new JSON key file as "google-credentials.json" in the server directory and restart the server.
`);
