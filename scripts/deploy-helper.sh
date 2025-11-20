#!/bin/bash

# CupsUp Scheduler - Deployment Helper Script
# Makes it easy to copy code to Google Apps Script

echo "════════════════════════════════════════════════════════════"
echo "   CupsUp Scheduler - Deployment Helper"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "This script will help you deploy to Google Sheets"
echo ""

# Function to display a menu
show_menu() {
    echo "Choose an option:"
    echo ""
    echo "  1) Open Code.gs in default editor"
    echo "  2) Open ui.html in default editor"
    echo "  3) Copy Code.gs to clipboard"
    echo "  4) Copy ui.html to clipboard"
    echo "  5) Print Code.gs to terminal"
    echo "  6) Print ui.html to terminal"
    echo "  7) Open your Google Sheet in browser"
    echo "  8) Open Apps Script editor (via Sheet)"
    echo "  9) Show deployment checklist"
    echo "  0) Exit"
    echo ""
    read -p "Enter choice [0-9]: " choice
    echo ""
}

# Main loop
while true; do
    show_menu

    case $choice in
        1)
            echo "Opening Code.gs in default editor..."
            open "src/Code.gs"
            echo "✅ Opened!"
            echo ""
            ;;
        2)
            echo "Opening ui.html in default editor..."
            open "src/ui.html"
            echo "✅ Opened!"
            echo ""
            ;;
        3)
            echo "Copying Code.gs to clipboard..."
            cat "src/Code.gs" | pbcopy
            echo "✅ Copied! Paste with Cmd+V in Apps Script editor"
            echo ""
            ;;
        4)
            echo "Copying ui.html to clipboard..."
            cat "src/ui.html" | pbcopy
            echo "✅ Copied! Paste with Cmd+V in ui HTML file"
            echo ""
            ;;
        5)
            echo "Code.gs content:"
            echo "────────────────────────────────────────────────────────────"
            cat "src/Code.gs"
            echo "────────────────────────────────────────────────────────────"
            echo ""
            ;;
        6)
            echo "ui.html content:"
            echo "────────────────────────────────────────────────────────────"
            cat "src/ui.html"
            echo "────────────────────────────────────────────────────────────"
            echo ""
            ;;
        7)
            echo "Opening your Google Sheet..."
            open "https://docs.google.com/spreadsheets/d/1DhCgKeH3b9MX0Aa4U9u70Kg63ayae710h0B_s0LsaK4/edit"
            echo "✅ Opened in browser!"
            echo ""
            ;;
        8)
            echo "Opening Google Sheet (you'll need to click Extensions → Apps Script)..."
            open "https://docs.google.com/spreadsheets/d/1DhCgKeH3b9MX0Aa4U9u70Kg63ayae710h0B_s0LsaK4/edit"
            echo "✅ Sheet opened! Now click: Extensions → Apps Script"
            echo ""
            ;;
        9)
            echo "════════════════════════════════════════════════════════════"
            echo "   DEPLOYMENT CHECKLIST"
            echo "════════════════════════════════════════════════════════════"
            echo ""
            echo "STEP 1: Prepare Google Sheet"
            echo "  □ Create 3 sheets: Settings, Employees, Assignments"
            echo "  □ Add headers to each sheet"
            echo "  □ Fill in Settings with your info"
            echo "  □ Add test employees"
            echo ""
            echo "STEP 2: Deploy Apps Script"
            echo "  □ Extensions → Apps Script"
            echo "  □ Delete default code"
            echo "  □ Paste Code.gs (use option 3 above)"
            echo "  □ Create 'ui' HTML file"
            echo "  □ Paste ui.html (use option 4 above)"
            echo "  □ Save both files"
            echo ""
            echo "STEP 3: Deploy Web App"
            echo "  □ Deploy → New deployment"
            echo "  □ Type: Web app"
            echo "  □ Execute as: Me"
            echo "  □ Who has access: Only myself"
            echo "  □ Copy Web App URL"
            echo ""
            echo "STEP 4: Test"
            echo "  □ Refresh Google Sheet"
            echo "  □ See '🧪 CupsUp Tests' menu"
            echo "  □ Run all tests"
            echo ""
            echo "════════════════════════════════════════════════════════════"
            echo ""
            echo "📖 For detailed instructions, see:"
            echo "   - QUICK_DEPLOY.md (quick start)"
            echo "   - DEPLOY_TO_SHEETS.md (complete guide)"
            echo ""
            ;;
        0)
            echo "Goodbye! 👋"
            echo ""
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            echo ""
            ;;
    esac

    read -p "Press Enter to continue..."
    echo ""
    echo ""
done
