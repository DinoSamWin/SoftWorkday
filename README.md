
# SoftWorkday: Mindful Support

A professional grounding companion for the modern office worker. Available as a Chrome Extension and a standalone Web App.

## 🚀 Release Checklist

### 1. Web Hosting (Vercel/Netlify)
1. Push this code to a GitHub repository.
2. In your hosting dashboard (Vercel/Netlify), set up a new project from the repo.
3. Add Environment Variables:
   - `API_KEY`: Your Google Gemini API Key.
4. **Important**: If using a custom domain, ensure the build command is `npm run build` and output directory is `dist`.

### 2. Chrome Web Store Publishing
1. Run `npm run build` to generate the production `dist/` folder.
2. Zip the contents of the `dist/` folder.
3. Upload to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. **Screenshots Required**:
   - Popup (Default Generation View)
   - Detail Page (Click a notification or generate message)
   - Settings Page (Notification schedule)
5. **Permissions**: Ensure `notifications`, `storage`, and `alarms` are declared in `manifest.json`.

## 🛠 Navigation Flows
- **Extension Icon Click**: Opens the root URL (`/`), presenting the mood selector.
- **Notification Click**: Opens a specific detail URL (`/?m=note_morning_123456`), which loads the uniquely archived message for that moment.

## 📦 Technical Setup
```bash
npm install
npm run dev   # Local development
npm run build # Production build for Extension/Web
```

## Built With
- **React 18 & TypeScript**
- **Tailwind CSS** (Design System)
- **Google Gemini API** (Contextual AI Messages)
- **Chrome Alarms & Notifications** (User Engagement)
