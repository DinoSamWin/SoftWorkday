
# SoftWorkday: Mindful Support

A realistic, non-cliché grounding companion for the modern office worker.

## Deployment Instructions

### 1. Web Hosting (Vercel/Netlify)
1. Push this code to a GitHub repository.
2. Connect the repository to **Vercel**.
3. In the Vercel Project Settings, add an Environment Variable:
   - Key: `API_KEY`
   - Value: `YOUR_GEMINI_API_KEY`
4. Deploy.

### 2. Chrome Extension
1. Run `npm install` and `npm run build`.
2. The `dist/` folder will contain your production-ready extension.
3. Go to `chrome://extensions` in your browser.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the `dist/` folder.

## Built With
- **React 18** & **TypeScript**
- **Tailwind CSS** (Styling)
- **Google Gemini API** (AI Grounding Messages)
- **Vite** (Build Tool)
