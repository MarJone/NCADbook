# Claude Code Setup & Iteration Guide

## 🚀 Getting Started with Claude Code

### Step 1: Install Claude Code
```bash
# Install Claude Code via npm
npm install -g @anthropic-ai/claude-code

# Or install via pip
pip install claude-code

# Verify installation
claude-code --version
```

### Step 2: Authentication Setup
```bash
# Set up your Anthropic API key
export ANTHROPIC_API_KEY=your_api_key_here

# Or add to your shell profile (~/.bashrc, ~/.zshrc)
echo 'export ANTHROPIC_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Project Setup
```bash
# Create project directory
mkdir equipment-booking-system
cd equipment-booking-system

# Initialize git repository (IMPORTANT - Claude Code works with git)
git init
git add .
git commit -m "Initial commit"

# Create basic project structure
mkdir -p css js config student admin
touch index.html README.md
```

### Step 4: Start Claude Code Session
```bash
# Start Claude Code in your project directory
claude-code

# This opens an interactive session where you can chat with Claude
# and it can read/write files in your project
```

## 📝 How to Use Your Prompt Effectively

### Step 5: Initial Project Setup
**First message to Claude Code:**
```
I want to build an equipment booking system for a National College. Here are my complete requirements:

[Paste your entire Claude Code prompt here]

Please start by:
1. Setting up the basic project structure
2. Creating the main index.html with login functionality
3. Setting up the CSS framework based on the wireframe
4. Creating the Supabase configuration

Let's focus on Phase 1 MVP features first.
```

### Step 6: Iterative Development Pattern
**Follow this pattern for each feature:**
```
"Now let's add [specific feature]. Please:
1. Create the necessary HTML files
2. Add the required JavaScript functionality  
3. Update the CSS to match the wireframe
4. Test the integration with existing code

Focus on [specific user story from the PRD]"
```

## 🔄 Best Practices for Iteration

### 1. **Start Small, Build Incrementally**
```
Session 1: Basic structure + login
Session 2: Equipment browsing page
Session 3: Booking calendar
Session 4: Admin approval system
Session 5: Google Sheets integration
```

### 2. **Be Specific with Requests**
❌ **Bad:** "Add the booking system"
✅ **Good:** "Add a booking calendar that shows a month view with color-coded availability. When a student clicks a date, it should toggle selection and auto-select weekends if Friday is chosen."

### 3. **Reference Your Artifacts**
```
"Looking at the wireframe I provided, the equipment browse page should have:
- Glass morphism cards for each equipment item
- Search bar at the top with gradient styling
- Filter buttons on the left sidebar
- Grid layout matching the design

Please implement this exactly as shown in the wireframe."
```

### 4. **Test and Iterate**
```
"Let's test the booking calendar. Can you:
1. Add some sample equipment data
2. Create test bookings to verify conflict detection
3. Ensure the color coding works correctly
4. Test the weekend auto-selection feature"
```

## 🛠️ Claude Code Workflow Tips

### Git Integration
Claude Code works best with git, so commit frequently:
```bash
# After each major feature
git add .
git commit -m "Add equipment browsing functionality"

# Claude Code can see your git history and understand changes
```

### File Management
Claude Code can:
- ✅ Read and write any file in your project
- ✅ Create new files and directories
- ✅ Understand your file structure
- ✅ Reference existing code when adding features

### Testing Integration
```bash
# You can ask Claude Code to:
# 1. Set up a local server
# 2. Create test data
# 3. Write basic tests
# 4. Debug issues

"Can you set up a simple local server to test this? 
Add some sample equipment data so I can test the browsing functionality."
```

## 📋 Recommended Session Structure

### Session 1: Foundation
**Goals:**
- Project structure setup
- Basic HTML templates
- CSS framework with wireframe styling
- Authentication system
- Supabase configuration

**Key Message:**
```
"Let's start with the foundation. Please:
1. Set up the complete file structure as outlined
2. Create index.html with login form matching the wireframe
3. Set up the main.css with the glass morphism and gradient styling
4. Add basic Supabase configuration
5. Create simple authentication flow"
```

### Session 2: Student Portal
**Goals:**
- Equipment browsing page
- Search and filter functionality
- Equipment detail views
- Navigation between pages

**Key Message:**
```
"Now let's build the student equipment browsing experience:
1. Create student/browse.html with the equipment grid
2. Implement search and category filtering
3. Add equipment detail modals
4. Ensure it matches the wireframe design exactly"
```

### Session 3: Booking System
**Goals:**
- Calendar implementation
- Date selection logic
- Booking form
- Multi-item booking

**Key Message:**
```
"Let's implement the booking calendar:
1. Create a month-view calendar component
2. Add color-coded availability display
3. Implement date selection with weekend auto-selection
4. Create the booking submission form
5. Add conflict detection"
```

### Session 4: Admin Portal
**Goals:**
- Admin dashboard
- Booking approval system
- Equipment management
- Basic reporting

**Key Message:**
```
"Now for the admin portal:
1. Create admin dashboard with key metrics
2. Add booking approval interface
3. Implement equipment management (add/edit/delete)
4. Create basic usage reporting"
```

### Session 5: Integration & Polish
**Goals:**
- Google Sheets integration
- Email notifications
- Testing and debugging
- Performance optimization

**Key Message:**
```
"Let's integrate external services:
1. Add Google Sheets import functionality
2. Set up EmailJS for notifications
3. Test all user flows end-to-end
4. Optimize performance and fix any bugs"
```

## 🔍 Troubleshooting Common Issues

### Claude Code Not Seeing Files
```bash
# Make sure you're in the right directory
pwd

# Restart Claude Code
exit
claude-code
```

### Git Issues
```bash
# If Claude Code mentions git issues
git add .
git commit -m "Current progress"
```

### API Key Issues
```bash
# Verify your API key is set
echo $ANTHROPIC_API_KEY

# Or set it temporarily
export ANTHROPIC_API_KEY=your_key_here
```

## 💡 Pro Tips for Success

### 1. **Keep Your Wireframe Open**
Always reference your wireframe URL when asking for UI implementation:
```
"Looking at the wireframe (https://drive.google.com/file/d/11Qmqb1Se6Sh2mJWKxe8SWu2a0rv2QxOV/view?usp=sharing), 
the login page should have..."
```

### 2. **Break Down Complex Features**
Instead of "build the entire booking system," try:
```
"Let's start with just the calendar display"
Then: "Now add date selection functionality"  
Then: "Now add the booking form"
```

### 3. **Use Your PRD for Context**
```
"Remember, this is for a National College with 1,600 students and 200+ equipment items. 
The main goal is reducing admin time from 2 hours/day to under 30 minutes."
```

### 4. **Ask for Explanations**
```
"Can you explain how the booking conflict detection works? 
I want to make sure it handles edge cases properly."
```

### 5. **Request Testing Code**
```
"Can you add some sample data and a simple test to verify 
the calendar is showing availability correctly?"
```

## 🎯 Success Indicators

You'll know you're on the right track when:
- ✅ Files are being created and updated automatically
- ✅ Code follows your wireframe design
- ✅ Features build on each other logically
- ✅ Claude Code references previous work when adding new features
- ✅ You can test functionality in a browser

## 🚨 Red Flags to Watch For

Stop and clarify if:
- ❌ Claude Code isn't creating actual files
- ❌ The design doesn't match your wireframe
- ❌ Code isn't following your specified tech stack
- ❌ Features aren't connecting properly
- ❌ No testing or sample data is provided

## 📞 Getting Help

If you run into issues:
1. **Check the Claude Code documentation**: https://docs.anthropic.com/en/docs/claude-code
2. **Restart your session** if Claude Code seems confused
3. **Commit your work** frequently so you can revert if needed
4. **Be specific** about what's not working

---

**Remember**: Claude Code is powerful but works best with clear, specific instructions and good project structure. Take it step by step, test frequently, and don't hesitate to ask for explanations or modifications!