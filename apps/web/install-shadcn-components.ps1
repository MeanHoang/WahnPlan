# Script to install multiple Shadcn components
$components = @(
    "button",
    "input", 
    "card",
    "dialog",
    "dropdown-menu",
    "form",
    "label",
    "textarea",
    "select",
    "toast"
)

foreach ($component in $components) {
    Write-Host "Installing $component..." -ForegroundColor Green
    pnpm dlx shadcn@latest add $component --yes
    Write-Host "$component installed successfully!" -ForegroundColor Green
    Write-Host "----------------------------------------"
}

Write-Host "All components installed successfully!" -ForegroundColor Yellow
