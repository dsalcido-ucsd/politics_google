# Deployment Guide

## Overview
This guide explains how to deploy your "Interfaces of Power" visualization project to various hosting platforms.

## Local Testing (Current Setup)

You're already running the app locally:
```bash
cd interfaces-of-power/public
python -m http.server 8000
```
Visit: http://localhost:8000

---

## Option 1: GitHub Pages (Recommended - Free)

### Setup Steps:

1. **Prepare your repository**:
   ```bash
   cd d:\DSC209R\politics_google
   git add .
   git commit -m "Complete explorable explanation with all visualizations"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: Select `/interfaces-of-power/public`
   - Click Save

3. **Access your site**:
   - URL will be: `https://yourusername.github.io/politics_google/`
   - May take 5-10 minutes to deploy

### Important Notes:
- Make sure `data/processed/` CSV files are committed (they're small enough)
- All paths in your code are relative, so no changes needed
- Free for public repositories

---

## Option 2: Netlify (Also Free, Easier)

### Setup Steps:

1. **Sign up** at [netlify.com](https://www.netlify.com) (free account)

2. **Deploy via drag-and-drop**:
   - Click "Add new site" → "Deploy manually"
   - Drag the `interfaces-of-power/public` folder into the upload zone
   - Netlify automatically deploys and gives you a URL

3. **Or deploy from GitHub**:
   - Click "Add new site" → "Import from Git"
   - Connect your GitHub account
   - Select your repository
   - Base directory: `interfaces-of-power/public`
   - Build command: (leave empty)
   - Publish directory: `.`
   - Click "Deploy"

4. **Custom domain** (optional):
   - You can set up a custom domain in Netlify settings
   - Or use the free `*.netlify.app` subdomain

---

## Option 3: Vercel (Fast & Free)

1. **Sign up** at [vercel.com](https://vercel.com)

2. **Import project**:
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Root Directory: `interfaces-of-power/public`
   - Framework Preset: "Other"
   - Click "Deploy"

3. **Access**: Gets a URL like `https://your-project.vercel.app`

---

## Submission Checklist for DSC 209

Before submitting your project:

### ✅ Code & Files
- [ ] All CSV files in `public/data/processed/` are committed
- [ ] Notebook `01_prepare_data.ipynb` runs without errors
- [ ] All JavaScript files are properly formatted
- [ ] CSS is clean and organized
- [ ] No console errors when running locally

### ✅ Documentation
- [ ] README.md is complete with project overview
- [ ] Data sources are properly cited
- [ ] Instructions for running locally are clear
- [ ] Key insights are documented

### ✅ Visualizations
- [ ] All 5 visualizations render correctly
- [ ] Tooltips work on hover
- [ ] Charts are labeled with axes and legends
- [ ] Colors are accessible and meaningful
- [ ] Responsive design works on different screen sizes

### ✅ Deployment
- [ ] Site is live and accessible via public URL
- [ ] All data loads correctly on deployed version
- [ ] No broken links or missing resources
- [ ] Page loads in under 3 seconds

### ✅ Academic Integrity
- [ ] All data sources cited in footer
- [ ] Code is original or properly attributed
- [ ] Project statement mentions DSC 209
- [ ] Author information is updated

---

## Testing Your Deployment

After deploying, verify:

1. **Load test**: Open in incognito/private window
2. **Data loads**: Check browser console for 404 errors
3. **Interactivity**: Test all tooltips and hover effects
4. **Mobile**: View on phone or use browser dev tools
5. **Speed**: Run Lighthouse audit in Chrome DevTools

---

## Updating Your Deployment

### GitHub Pages:
```bash
git add .
git commit -m "Update visualizations"
git push origin main
# Auto-deploys in ~5 minutes
```

### Netlify/Vercel:
- Push to GitHub (auto-deploys via webhook)
- Or manually upload new files via their dashboards

---

## Troubleshooting

### Issue: CSV files not loading
**Solution**: Check that paths in `data-loader.js` match your folder structure
```javascript
// Should be relative to index.html location
await d3.csv('data/processed/political_ads_party_weekly.csv')
```

### Issue: D3 visualizations don't appear
**Solution**: Check browser console for errors. Common issues:
- D3.js script not loading from CDN
- CSV files return 404
- JavaScript syntax errors

### Issue: Styles not applying
**Solution**: Verify CSS path in index.html:
```html
<link rel="stylesheet" href="assets/css/styles.css">
```

### Issue: Charts render but look broken
**Solution**: Check that data processing completed successfully:
```bash
# Re-run notebook to regenerate CSVs
jupyter notebook notebooks/01_prepare_data.ipynb
```

---

## Performance Optimization (Optional)

For faster loading:

1. **Minify CSS/JS**: Use online tools or build scripts
2. **Compress CSVs**: Keep only essential columns
3. **Lazy load**: Load visualizations as user scrolls
4. **CDN**: Use D3 from CDN (already done)
5. **Caching**: Add service worker for offline access

---

## Support & Resources

- **D3.js Documentation**: https://d3js.org/
- **GitHub Pages Guide**: https://pages.github.com/
- **Netlify Docs**: https://docs.netlify.com/
- **Vercel Docs**: https://vercel.com/docs

---

Good luck with your submission! 🎉
