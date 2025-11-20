# Scheduler Dark Theme Update Instructions

This directory contains the code required to update the external CupsUp Scheduler Google Apps Script application to match the "Midnight Sauce" dark theme.

## 📁 Files

- `scheduler-dark-theme.html`: Contains the CSS styles and font links.

## 🚀 How to Apply the Update

1.  **Access the Google Apps Script Project**:
    - Go to [Google Apps Script](https://script.google.com).
    - Open the "CupsUp Scheduler" project.

2.  **Locate the HTML File**:
    - Find the HTML file that contains the CSS styles. It is likely named `Index.html`, `Stylesheet.html`, or `Page.html`.
    - If the styles are embedded in the main HTML file, look for the `<style>` tag.

3.  **Update the Styles**:
    - Open `scheduler-dark-theme.html` from this directory.
    - Copy the entire content (including the `<link>` tags for fonts and the `<style>` block).
    - Paste it into the Google Apps Script HTML file.
    - **Important**: Paste it **after** any existing styles to ensure the new dark theme overrides the old light theme. Alternatively, replace the existing `<style>` block if you want to completely replace the old styles.

4.  **Save and Deploy**:
    - Save the project in the Google Apps Script editor.
    - Deploy the web app as a new version to make the changes live.
        - Click "Deploy" > "New deployment".
        - Select "Web app".
        - Click "Deploy".

5.  **Verify**:
    - Open the Scheduler Web App URL.
    - Verify that the dark theme is applied correctly and matches the reference screenshots.

## 🎨 Theme Details

The new theme uses the "Midnight Sauce" color palette:
- **Background**: `#1c1410` (Warm 950)
- **Cards**: `#292420` (Warm 900)
- **Accents**: `#dc2626` (Sauce Red), `#f59e0b` (Amber), `#10b981` (Green), `#a855f7` (Purple)
- **Typography**: Manrope (Headings), Inter (Body), JetBrains Mono (Data/Time)
