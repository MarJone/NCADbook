# NCADbook - Windows Setup Script
# Run with: powershell -ExecutionPolicy Bypass -File setup-windows.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NCADbook - Windows Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Some operations may fail without admin privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Function to check if command exists
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Function to prompt for continuation
function Prompt-Continue($message) {
    Write-Host ""
    $response = Read-Host "$message (Y/N)"
    return $response -eq "Y" -or $response -eq "y"
}

# Step 1: Check Prerequisites
Write-Host "Step 1: Checking Prerequisites..." -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$hasNode = Test-Command "node"
$hasNpm = Test-Command "npm"
$hasPsql = Test-Command "psql"
$hasGit = Test-Command "git"

if ($hasNode) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js: Not found" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if ($hasNpm) {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm: Not found" -ForegroundColor Red
    exit 1
}

if ($hasGit) {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git: Not found (optional)" -ForegroundColor Yellow
    Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Yellow
}

# Check for PostgreSQL
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (Test-Path $psqlPath) {
    $psqlVersion = & $psqlPath --version
    Write-Host "✅ PostgreSQL: $psqlVersion" -ForegroundColor Green
} elseif ($hasPsql) {
    $psqlVersion = psql --version
    Write-Host "✅ PostgreSQL: $psqlVersion" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL: Not found" -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
if (-not (Prompt-Continue "Prerequisites check complete. Continue with setup?")) {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

# Step 2: Install Frontend Dependencies
Write-Host ""
Write-Host "Step 2: Installing Frontend Dependencies..." -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

if (Test-Path "package.json") {
    Write-Host "Running: npm install" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend installation failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ package.json not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}

# Step 3: Install Backend Dependencies
Write-Host ""
Write-Host "Step 3: Installing Backend Dependencies..." -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

if (Test-Path "backend/package.json") {
    Push-Location backend
    Write-Host "Running: npm install (in backend/)" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend installation failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Host "❌ backend/package.json not found" -ForegroundColor Red
    exit 1
}

# Step 4: Setup Environment File
Write-Host ""
Write-Host "Step 4: Setting up Environment Configuration..." -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

if (-not (Test-Path "backend/.env")) {
    if (Test-Path "backend/.env.example") {
        Copy-Item "backend/.env.example" "backend/.env"
        Write-Host "✅ Created backend/.env from .env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Edit backend/.env and update:" -ForegroundColor Yellow
        Write-Host "   - DB_PASSWORD (your PostgreSQL password)" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET (generate a random string)" -ForegroundColor Yellow
        Write-Host ""

        if (Prompt-Continue "Would you like to open .env file now?") {
            notepad "backend\.env"
            Write-Host ""
            Read-Host "Press Enter when you've updated the .env file"
        }
    } else {
        Write-Host "❌ backend/.env.example not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ backend/.env already exists" -ForegroundColor Green
}

# Step 5: Database Setup
Write-Host ""
Write-Host "Step 5: Database Setup..." -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "This step requires:" -ForegroundColor Yellow
Write-Host "  1. PostgreSQL service running" -ForegroundColor Yellow
Write-Host "  2. Database credentials configured in backend/.env" -ForegroundColor Yellow
Write-Host "  3. Database user and database created" -ForegroundColor Yellow
Write-Host ""

if (Prompt-Continue "Have you created the PostgreSQL user and database? (See SETUP_NEW_PC.md)") {

    Write-Host ""
    Write-Host "Creating database schema..." -ForegroundColor Cyan
    Push-Location backend
    npm run db:setup

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema created" -ForegroundColor Green

        Write-Host ""
        if (Prompt-Continue "Would you like to seed the database with demo data?") {
            Write-Host "Seeding database..." -ForegroundColor Cyan
            npm run db:seed

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database seeded with demo data" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Database seeding had issues (non-critical)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ Database setup failed" -ForegroundColor Red
        Write-Host "   Check your .env configuration and database credentials" -ForegroundColor Yellow
        Pop-Location
        exit 1
    }

    Pop-Location
} else {
    Write-Host ""
    Write-Host "⚠️  Skipping database setup" -ForegroundColor Yellow
    Write-Host "   You'll need to run these commands manually:" -ForegroundColor Yellow
    Write-Host "   1. cd backend" -ForegroundColor Cyan
    Write-Host "   2. npm run db:setup" -ForegroundColor Cyan
    Write-Host "   3. npm run db:seed" -ForegroundColor Cyan
}

# Step 6: Installation Complete
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Access application at:" -ForegroundColor Cyan
Write-Host "  http://localhost:5175/NCADbook/" -ForegroundColor White
Write-Host ""
Write-Host "Demo login credentials:" -ForegroundColor Cyan
Write-Host "  Student:       student1@ncad.ie / password123" -ForegroundColor White
Write-Host "  Dept Admin:    admin.graphics@ncad.ie / admin123" -ForegroundColor White
Write-Host "  Master Admin:  master.admin@ncad.ie / masteradmin123" -ForegroundColor White
Write-Host ""
Write-Host "For detailed documentation, see:" -ForegroundColor Cyan
Write-Host "  SETUP_NEW_PC.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
Write-Host ""

# Offer to open documentation
if (Prompt-Continue "Would you like to open the setup documentation?") {
    notepad "SETUP_NEW_PC.md"
}
