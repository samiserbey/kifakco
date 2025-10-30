# Deployment Guide for Hostinger

## Deployment Steps

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the entire `dist` folder contents** to your Hostinger file manager:
   - Go to Hostinger → File Manager
   - Navigate to `public_html` (or your domain's root directory)
   - Delete any existing files
   - Upload ALL contents from the `dist` folder (including hidden files like `.htaccess`)

3. **Test your deployment**:
   - Access your root URL: `https://yourdomain.com/`
   - Access direct routes: `https://yourdomain.com/products`
   - Both should work now!
