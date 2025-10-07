# 🚀 NCADbook Deployment Guide

**Netlify Deployment for Demo/Stakeholder Presentations**

---

## 📋 **Pre-Deployment Checklist**

Before deploying, ensure:

- [ ] All code is committed to Git
- [ ] `npm install` runs without errors
- [ ] `npm run build` completes successfully
- [ ] Demo mode is enabled (`VITE_DEMO_MODE=true`)
- [ ] All 9 roles are tested and working
- [ ] Login images are present in `/public`
- [ ] No sensitive credentials in code

---

## 🎯 **Deployment Method 1: Netlify Drag & Drop** (Easiest)

### **Step 1: Build the Project**

```bash
# Navigate to project directory
cd C:\Users\jones\AIprojects\NCADbook

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This creates a `dist` folder with optimized production files.

### **Step 2: Deploy to Netlify**

1. Go to [netlify.com](https://www.netlify.com) and sign in (or create free account)
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the entire **`dist`** folder into the upload area
4. Wait for deployment to complete (~30 seconds)
5. Netlify will provide a random URL like: `https://random-name-123.netlify.app`

### **Step 3: Configure Custom Domain** (Optional)

1. In Netlify dashboard → **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your preferred subdomain: `ncadbook.netlify.app` or `ncad-demo.netlify.app`
4. Confirm domain settings

### **Step 4: Set Environment Variables**

1. Site settings → **Environment variables**
2. Click **"Add a variable"**
3. Add:
   ```
   Key:   VITE_DEMO_MODE
   Value: true
   ```
4. Save changes
5. Trigger a redeploy: **Deploys** → **Trigger deploy** → **Deploy site**

---

## 🔄 **Deployment Method 2: Netlify CLI** (For Automation)

### **Step 1: Install Netlify CLI**

```bash
npm install -g netlify-cli
```

### **Step 2: Login to Netlify**

```bash
netlify login
```

This opens a browser window to authorize the CLI.

### **Step 3: Initialize Project** (First Time Only)

```bash
# Navigate to project directory
cd C:\Users\jones\AIprojects\NCADbook

# Link project to Netlify
netlify init
```

Follow the prompts:
- **Create & configure a new site**
- Choose your team/account
- Site name: `ncadbook` (or your preferred name)
- Build command: `npm run build`
- Publish directory: `dist`

### **Step 4: Deploy**

```bash
# Production deployment
netlify deploy --prod

# Or deploy to preview first
netlify deploy
```

The CLI will output the live URL.

### **Step 5: Set Environment Variables via CLI**

```bash
netlify env:set VITE_DEMO_MODE true
```

---

## 🔗 **Deployment Method 3: Git-Based (Continuous Deployment)**

### **Step 1: Push to GitHub/GitLab**

```bash
# Add all changes
git add .

# Commit
git commit -m "feat: Ready for demo deployment"

# Push to remote
git push origin main
```

### **Step 2: Connect Repository to Netlify**

1. Netlify dashboard → **Add new site** → **Import from Git**
2. Choose provider: **GitHub** / **GitLab** / **Bitbucket**
3. Authorize Netlify to access your repositories
4. Select the `NCADbook` repository
5. Configure build settings:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **"Deploy site"**

### **Step 3: Add Environment Variables**

1. Site settings → **Environment variables**
2. Add `VITE_DEMO_MODE = true`
3. Redeploy will happen automatically

### **Benefits of Git-Based Deployment**
- ✅ Auto-deploy on every push to `main`
- ✅ Deploy previews for pull requests
- ✅ Rollback to previous deployments easily
- ✅ Build logs and error tracking

---

## 🔧 **Configuration Files**

The project includes these files for Netlify:

### **netlify.toml**
Located at project root. Pre-configured with:
- Build command and publish directory
- SPA redirects (all routes → index.html)
- Security headers
- Asset caching rules
- Demo mode environment variable

### **package.json**
Build scripts already configured:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🌐 **Post-Deployment Verification**

### **Step 1: Test All Portals**

Visit your deployed URL and verify:

- [ ] **Login page loads** with artistic map
- [ ] **Student login** works (top-left quadrant)
- [ ] **Staff login** works (top-right quadrant)
- [ ] **Dept Admin login** works (bottom-left quadrant)
- [ ] **Master Admin login** works (bottom-right quadrant)
- [ ] **Specialized role demos** accessible via Role Management

### **Step 2: Test Core Features**

- [ ] Equipment browsing (filters work)
- [ ] Booking creation
- [ ] Booking approvals (swipe actions on mobile)
- [ ] Role Management feature flags toggle
- [ ] System Settings configuration
- [ ] Analytics dashboard loads
- [ ] PDF/CSV export works

### **Step 3: Mobile Responsiveness**

Test on actual devices or browser dev tools:

- [ ] iPhone (Safari) - portrait and landscape
- [ ] Android (Chrome) - portrait and landscape
- [ ] iPad (Safari) - portrait and landscape
- [ ] Desktop (Chrome, Firefox, Safari, Edge)

### **Step 4: Performance Check**

Use Netlify's built-in analytics or Lighthouse:

- [ ] Page load < 3 seconds
- [ ] Lighthouse score > 90 (Performance)
- [ ] No console errors
- [ ] All images load correctly

---

## 🎨 **Custom Domain Setup** (Optional)

### **Using Netlify Subdomain**

1. Site settings → **Domain management**
2. Click **"Options"** on default domain → **"Edit site name"**
3. Change from `random-name-123` to `ncadbook`
4. New URL: `https://ncadbook.netlify.app`

### **Using Custom Domain** (ncad.ie subdomain)

1. Site settings → **Domain management** → **"Add domain"**
2. Enter: `booking.ncad.ie` or `equipment.ncad.ie`
3. Netlify provides DNS instructions:
   ```
   Type:  CNAME
   Name:  booking (or equipment)
   Value: <your-site>.netlify.app
   ```
4. Add this CNAME record to NCAD's DNS (requires IT access)
5. Wait for DNS propagation (5-60 minutes)
6. Netlify will auto-provision SSL certificate

---

## 🔒 **Security Configuration**

### **HTTPS Enforcement** (Auto-enabled)
Netlify provides free SSL certificates. All HTTP traffic redirects to HTTPS.

### **Security Headers** (Pre-configured in netlify.toml)
- `X-Frame-Options: DENY` (prevents clickjacking)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### **Password Protection** (For Private Demos)

If you need password-protected access:

1. Site settings → **Visitor access**
2. Enable **"Password protection"**
3. Set password: `ncad2025` (or your choice)
4. Share password with stakeholders only

---

## 📊 **Analytics Setup** (Optional)

### **Netlify Analytics** (Built-in)

1. Site overview → **Enable analytics**
2. Costs $9/month per site
3. Provides: Page views, unique visitors, top pages, bandwidth usage

### **Google Analytics** (Free)

1. Create Google Analytics property
2. Get tracking ID: `G-XXXXXXXXXX`
3. Add to `index.html` before `</head>`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
4. Redeploy

---

## 🐛 **Troubleshooting Deployment Issues**

### **Build Fails: "npm ERR!"**

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try build again
npm run build
```

### **Blank Page After Deployment**

**Possible causes:**
1. **SPA routing not configured**
   - Check `netlify.toml` has redirect rule: `/* → /index.html`
   - Redeploy if missing

2. **Environment variables missing**
   - Add `VITE_DEMO_MODE=true` in Netlify
   - Trigger redeploy

3. **Build errors not visible**
   - Check Netlify build logs: **Deploys** → Click failed deploy → **Deploy log**

### **404 on Page Refresh**

**Solution:** Ensure `netlify.toml` includes:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Slow Load Times**

**Optimizations:**
1. Enable asset optimization in Netlify:
   - Site settings → **Build & deploy** → **Post processing**
   - Enable: Bundle CSS, Minify CSS, Minify JS, Compress images

2. Check image sizes:
   ```bash
   # Optimize images before deployment
   npm install -g imageoptim-cli
   imageoptim --quality 85 public/**/*.png
   ```

---

## 🔄 **Updating the Deployed Site**

### **Method 1: Drag & Drop Update**

1. Make code changes locally
2. Run `npm run build`
3. Go to Netlify **Deploys** tab
4. Drag & drop new `dist` folder

### **Method 2: CLI Update**

```bash
# Make changes, then
npm run build
netlify deploy --prod
```

### **Method 3: Git Push** (If using Git-based deployment)

```bash
git add .
git commit -m "update: Demo improvements"
git push origin main
# Netlify auto-deploys
```

---

## 📱 **Sharing the Demo**

### **For Stakeholder Presentations**

1. **Get short URL:** Use [bit.ly](https://bitly.com) or [tinyurl.com](https://tinyurl.com) to create:
   ```
   https://bit.ly/ncadbook-demo
   ```

2. **Create QR Code:** Use [qr-code-generator.com](https://www.qr-code-generator.com):
   - Paste deployed URL
   - Download QR code image
   - Include in presentation slides

3. **Print credentials card:**
   - Open `DEMO_CREDENTIALS.md`
   - Print in landscape mode
   - Bring to presentation

### **Email Template for Stakeholders**

```
Subject: NCADbook Equipment Booking System - Demo Access

Hi Team,

The NCADbook demo is now live and ready for your review:

🔗 Demo URL: https://ncadbook.netlify.app

📝 Login Credentials:
- Master Admin: master@ncad.ie / master123
- Dept Admin: admin.commdesign@ncad.ie / admin123
- Staff: staff.commdesign@ncad.ie / staff123
- Student: commdesign.student1@student.ncad.ie / student123

📱 Best experienced on mobile for full feature demo.

📋 Demo Guide: [Link to DEMO_GUIDE.md]

Please explore all 9 roles and share your feedback!

Best regards,
[Your Name]
```

---

## 🎯 **Next Steps After Demo**

Once stakeholders approve:

1. **IT Infrastructure Meeting**
   - Database setup (Supabase vs. on-prem PostgreSQL)
   - Authentication integration (LDAP/SSO)
   - Email server configuration
   - Hosting decision (on-campus vs. cloud)

2. **Data Migration Planning**
   - Export student roster from existing system
   - Prepare equipment catalog CSV
   - Map department structure
   - Define user role assignments

3. **Production Deployment**
   - Set `VITE_DEMO_MODE=false`
   - Configure Supabase credentials
   - Run database migrations
   - Import production data
   - Enable email notifications

4. **Training & Rollout**
   - Admin training sessions (2-3 hours)
   - Student orientation (optional)
   - Soft launch with one department
   - Phased rollout across NCAD

---

## 📞 **Support During Demo**

If you encounter issues during the stakeholder presentation:

- **Check Netlify Status:** [status.netlify.com](https://status.netlify.com)
- **View Build Logs:** Netlify Dashboard → Deploys → Deploy Log
- **Rollback if needed:** Deploys → Old deploy → **"Publish deploy"**
- **Emergency contact:** Have local `npm run dev` backup ready

---

## ✅ **Final Pre-Demo Checklist**

**24 Hours Before Presentation:**

- [ ] Deploy to Netlify successfully
- [ ] Test all 9 user roles
- [ ] Verify mobile responsiveness
- [ ] Check all images load
- [ ] Test PDF/CSV exports
- [ ] Print DEMO_CREDENTIALS.md
- [ ] Bookmark deployed URL
- [ ] Test on presentation device/projector
- [ ] Prepare backup (local dev server)
- [ ] Charge laptop/mobile devices

**1 Hour Before Presentation:**

- [ ] Test login on presentation WiFi
- [ ] Open all needed tabs in advance
- [ ] Close unnecessary browser tabs
- [ ] Clear browser cache
- [ ] Test projector/screen sharing
- [ ] Have DEMO_GUIDE.md open on second screen

---

**Deployment Version:** 2.0.0
**Platform:** Netlify
**Status:** 🟢 Production Ready
**Last Updated:** October 2025

**Need help?** Open an issue on GitHub or contact the development team.
