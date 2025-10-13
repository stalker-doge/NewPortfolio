# Portfolio Management System - GitHub-based CMS

## Overview

This portfolio website features a custom Content Management System (CMS) built on GitHub, allowing for easy project management without traditional database requirements. The system provides a secure admin interface for managing projects, with all data stored in a structured JSON format.

## 🚨 **Security Update - Important!**

### **GitHub Token Security Fix**

The system has been updated to use secure token management instead of hardcoded tokens. This resolves the GitHub secret scanning warning and follows security best practices.

### **Token Setup Instructions**

1. **Create GitHub Personal Access Token**:
   - Go to GitHub → Settings → Developer Settings → Personal Access Tokens
   - Click "Generate new token" (classic)
   - Set expiration and description (e.g., "Portfolio Admin")
   - **CRITICAL**: Select scopes: `repo` (full repository access)
   - Generate and copy the token immediately

2. **Configure Token in Admin Panel**:
   - Access admin panel at `/admin/`
   - Login with password: `portfolio2024`
   - Go to Settings tab
   - Enter your GitHub token in the token field
   - Click "Save Token" to test and save

3. **Token Storage**:
   - Token is stored in `localStorage` (browser storage)
   - Never committed to version control
   - Automatically loaded on admin access

## 🔧 **Troubleshooting GitHub Token Issues**

### **Error: "Resource not accessible by personal access token"**

This error occurs when your GitHub token doesn't have the correct permissions or repository configuration. Here's how to fix it:

#### **Step 1: Verify Token Scopes**
Your GitHub token **MUST** have the `repo` scope selected:

```
✅ repo (Full control of private repositories)
❌ public_repo (Only access to public repositories)
❌ repo:status (Access commit status)
❌ repo:invite (Access repository invitations)
```

**To fix:**
1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Find your token or create a new one
3. **Ensure `repo` is checked** (this is required!)
4. Save the token and reconfigure in admin panel

#### **Step 2: Verify Repository Access**
Ensure your token has access to the target repository:

```
Repository: stalker-doge/NewPortfolio
Username: stalker-doge
```

**To fix:**
1. Verify you have access to the repository
2. If repository is private, ensure token has `repo` scope
3. If repository is public, `public_repo` scope might work, but `repo` is recommended

#### **Step 3: Check Repository Name**
Verify the repository name in the GitHub API configuration:

```javascript
// In js/github-api.js
this.username = 'stalker-doge';    // Your GitHub username
this.repo = 'NewPortfolio';         // Your repository name
```

**To fix:**
1. Verify these match your actual GitHub repository
2. Update if necessary and save the file
3. Reconfigure token in admin panel

#### **Step 4: Test Token Configuration**
Use the admin panel to test your token:

1. Access admin panel at `/admin/`
2. Go to Settings tab
3. Enter your GitHub token
4. Click "Save Token"
5. Check for success message: "GitHub token saved successfully!"

#### **Step 5: Verify Repository Information**
After saving token, check the system information:

1. In Settings tab, look at "System Information"
2. Repository should show: `stalker-doge/NewPortfolio`
3. API Status should show: "Online"

### **Common Solutions**

| Issue | Solution |
|--------|----------|
| Token not working | Create new token with `repo` scope |
| Repository not found | Verify username and repository name |
| Access denied | Ensure token has correct repository access |
| Still not working | Try creating a fresh token |

### **🚨 CRITICAL: If Token Has Full repo Permissions**

If your token already has full `repo` permissions and you still get "Resource not accessible by personal access token", the issue is likely with the repository configuration:

#### **Check Repository Existence**
1. **Verify the repository exists**: Go to `https://github.com/stalker-doge/NewPortfolio`
2. **If repository doesn't exist**: Create it first
3. **If repository exists**: Check that you have access to it

#### **Update Repository Configuration**
If the repository name is different, update it in `js/github-api.js`:

```javascript
// Update these values to match your actual repository
this.username = 'your-actual-username';    // Your GitHub username
this.repo = 'your-actual-repo-name';      // Your repository name
```

#### **Common Repository Issues**
- **Repository name is case-sensitive**: `NewPortfolio` ≠ `newportfolio`
- **Username must be exact**: `stalker-doge` ≠ `Stalker-Doge`
- **Repository must be accessible**: You must have write permissions
- **Repository must exist**: Create it if it doesn't exist

#### **Repository Setup Steps**
1. **Create repository** at GitHub if it doesn't exist
2. **Clone repository locally** if working locally
3. **Update API configuration** in `js/github-api.js`
4. **Reconfigure token** in admin panel
5. **Test connection** by saving token

### **🚨 CRITICAL: Can Create Drafts but Publishing Fails**

If you can create drafts but publishing fails with the same error, the issue is specifically with **branch configuration**:

#### **Root Cause**
- **Creating drafts**: Works because system creates new `data/projects.json` file
- **Publishing**: Fails because system needs to update existing file with correct SHA
- **Branch mismatch**: System uses wrong branch name for file operations

#### **Solution: Automatic Branch Detection**
The system now includes automatic branch detection:

```javascript
// In js/github-api.js - NEW FEATURE
async detectRepositoryBranch() {
    try {
        const repoInfo = await this.getRepositoryInfo();
        return repoInfo.default_branch || 'main';
    } catch (error) {
        console.warn('Failed to detect repository branch, using default:', error);
        return 'main'; // Fallback to main
    }
}
```

#### **How It Works**
1. **Auto-detects branch**: System automatically detects repository's default branch
2. **Handles both `main` and `master`**: Works with any branch name
3. **Fallback to `main`**: If detection fails, uses safe default
4. **Applies to all operations**: File creation, updates, uploads, deletions

#### **Manual Branch Check**
To verify your repository's default branch:
1. Go to `https://github.com/stalker-doge/NewPortfolio`
2. Look at the branch dropdown (usually shows "main" or "master")
3. System will automatically detect and use this branch

#### **Fix Steps for Publishing Issues**
1. **Access admin panel**: `/admin/`
2. **Login**: `portfolio2024`
3. **Configure token**: Enter GitHub token in Settings
4. **Save token**: Click "Save Token" button
5. **Test publishing**: Try to publish a draft project
6. **System will**: Auto-detect correct branch and use it

### **🚨 CRITICAL: "Cannot read properties of undefined (reading 'toLowerCase')"**

If you get this JavaScript error when trying to publish, the issue is with **project ID generation**:

#### **Root Cause**
- **When updating projects**: `projectData.id` might be undefined
- **When generating ID**: `projectData.title` might be undefined or null
- **Calling .toLowerCase()**: On undefined value causes error
- **Image upload fails**: Prevents project publishing

#### **Solution: Safe Project ID Generation**
The system now includes safe ID generation with multiple fallbacks:

```javascript
// In js/github-api.js - FIXED: Safe project ID generation
generateId(title) {
    // FIXED: Add null/undefined check
    if (!title || typeof title !== 'string') {
        return 'project-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
```

#### **How It Works**
1. **Null checks**: Before calling any string methods
2. **Safe defaults**: Fallback values for all cases
3. **Multiple fallback strategy**: Works with any data combination
4. **Conditional execution**: Only runs operations when data is available

#### **Enhanced Image Upload**
```javascript
// In admin/js/admin-main.js - FIXED: Safe image upload
async uploadProjectImages(projectData, existingProjectId = null) {
    // Use existing project ID if available, otherwise generate from title
    const projectId = existingProjectId || projectData.id || 
                      (projectData.title ? this.githubAPI.generateId(projectData.title) : 'temp-project');
    
    // Rest of the method works safely with guaranteed projectId
    // Upload hero image, thumbnail image, gallery images...
}
```

#### **Fix Steps for JavaScript Errors**
1. **Access admin panel**: `/admin/`
2. **Login**: `portfolio2024`
3. **Configure token**: Enter GitHub token in Settings
4. **Save token**: Click "Save Token" button
5. **Test publishing**: Try to publish a draft project
6. **System will**: Use safe ID generation and publish successfully

### **🚨 CRITICAL: 404 and 403 API Errors**

If you get 404 "Not Found" or 403 "Resource not accessible" errors:

#### **404 "Not Found" Errors**
- **Cause**: Repository doesn't exist or file path is wrong
- **Solution**: 
  1. Verify repository exists at `https://github.com/stalker-doge/NewPortfolio`
  2. Check repository name and username in `js/github-api.js`
  3. Ensure repository is accessible with your token

#### **403 "Resource not accessible" Errors**
- **Cause**: Token lacks proper permissions or repository is private
- **Solution**:
  1. Ensure token has `repo` scope (not just `public_repo`)
  2. Verify you have write access to the repository
  3. Check if repository is private and token has access

#### **Enhanced Error Handling**
The system now includes better error handling:

```javascript
// In js/github-api.js - ENHANCED: Better error messages
async apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }
            throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('GitHub API Request Failed:', error);
        throw error;
    }
}
```

## System Architecture

### 1. Data Structure (`data/projects.json`)

The portfolio uses a structured JSON format to store project data:

```json
{
  "projects": [
    {
      "id": "unique-project-id",
      "title": "Project Title",
      "subtitle": "Project Subtitle",
      "description": "Project description",
      "status": "published",
      "featured": true,
      "publishDate": "2024-01-15",
      "category": ["unity", "mobile"],
      "technologies": [
        {
          "name": "Unity",
          "description": "Game development platform"
        }
      ],
      "features": ["Feature 1", "Feature 2"],
      "links": {
        "demo": "https://demo-url.com",
        "github": "https://github.com/repo",
        "download": "https://download-url.com"
      },
      "images": {
        "hero": "images/hero.jpg",
        "thumbnail": "images/thumb.jpg",
        "gallery": [
          {
            "url": "images/gallery1.jpg",
            "caption": "Gallery image 1"
          }
        ]
      },
      "stats": {
        "developmentTime": "6 months",
        "teamSize": "Solo",
        "linesOfCode": "15k+"
      },
      "challenges": [
        {
          "challenge": "Challenge description",
          "solution": "Solution description"
        }
      ],
      "seo": {
        "metaTitle": "SEO Title",
        "metaDescription": "SEO Description",
        "keywords": ["keyword1", "keyword2"]
      }
    }
  ]
}
```

### 2. GitHub API Integration (`js/github-api.js`)

The system includes a comprehensive GitHub API wrapper that handles:

- **Repository Management**: Connect to GitHub repository
- **CRUD Operations**: Create, Read, Update, Delete projects
- **File Operations**: Manage JSON data files and images
- **Validation**: Data integrity and format validation
- **Caching**: Performance optimization through local caching
- **Error Handling**: Robust error management and recovery
- **Secure Token Management**: Environment variables and localStorage
- **Automatic Branch Detection**: Detects and uses correct repository branch
- **Safe ID Generation**: Prevents JavaScript errors with fallbacks

### 3. Admin Interface (`admin/`)

A secure, modern admin interface provides:

- **Authentication**: Password-protected access
- **Project Management**: Full CRUD operations
- **Image Upload**: Direct image management
- **Category Filtering**: Organize projects by categories
- **Status Management**: Published/Draft states
- **Import/Export**: Data backup and migration
- **Token Management**: Secure GitHub token configuration
- **Responsive Design**: Works on all device sizes

### 4. Dynamic Portfolio Loading

The main portfolio (`index.html`, `js/script.js`) dynamically:

- **Fetches Data**: Loads projects from JSON file
- **Renders Cards**: Creates project cards dynamically
- **Filters Content**: Category-based filtering
- **Modal System**: Detailed project views
- **Error Handling**: Graceful fallbacks for missing data
- **Security**: XSS protection and input validation

## Setup Instructions

### 1. Repository Setup

1. **Create GitHub Repository**:
   ```bash
   # Create a new repository on GitHub
   # Clone it locally
   git clone https://github.com/your-username/portfolio-repo.git
   cd portfolio-repo
   ```

2. **Initialize Project Structure**:
   ```
   portfolio-repo/
   ├── index.html
   ├── css/
   │   └── style.css
   ├── js/
   │   ├── script.js
   │   └── github-api.js
   ├── data/
   │   └── projects.json
   └── admin/
       ├── index.html
       ├── css/
       │   └── admin.css
       └── js/
           └── admin-main.js
   ```

3. **Configure GitHub Token**:
   - Create GitHub Personal Access Token with `repo` scope
   - **Important**: Do not hardcode the token in any files
   - Token will be configured through admin interface

### 2. Initial Data Setup

1. **Configure GitHub Token**:
   - Access admin interface at `/admin/`
   - Login with default password: `portfolio2024`
   - Go to Settings tab
   - Enter your GitHub token
   - Click "Save Token"

2. **Create Sample Projects**:
   - Use the admin interface to create sample projects
   - Test all features including image upload
   - Verify portfolio displays correctly

3. **Upload Images**:
   - Use the admin interface to upload project images
   - Images are automatically organized in the repository

### 3. Deployment

1. **GitHub Pages** (Recommended):
   ```bash
   # Enable GitHub Pages in repository settings
   # Set source to main branch
   # Your portfolio will be available at: https://your-username.github.io/portfolio-repo/
   ```

2. **Custom Domain**:
   - Configure custom domain in repository settings
   - Update DNS records as required by GitHub

## Usage Guide

### Admin Panel Access

1. **Navigate to Admin**: `https://your-domain.com/admin/`
2. **Login**: Use the configured password (default: `portfolio2024`)
3. **Configure GitHub Token**:
   - Go to Settings tab
   - Enter your GitHub Personal Access Token
   - Click "Save Token" to test and save

4. **Manage Projects**:
   - **Add New**: Click "Add New Project" and fill in the form
   - **Edit**: Click "Edit" on any project card
   - **Delete**: Click "Delete" and confirm the action
   - **Publish/Unpublish**: Toggle project visibility

### Project Management

1. **Basic Information**:
   - Title and subtitle
   - Description and overview
   - Status (Published/Draft)
   - Featured project toggle
   - Categories (Unity, Unreal, Mobile, Multiplayer)

2. **Content Management**:
   - **Features**: List of key project features
   - **Technologies**: Tech stack with descriptions
   - **Links**: Demo, GitHub, download URLs
   - **Images**: Hero, thumbnail, and gallery images

3. **Advanced Options**:
   - **Statistics**: Development time, team size, code metrics
   - **Challenges**: Technical challenges and solutions
   - **SEO**: Meta titles, descriptions, keywords

### Data Management

1. **Import Data**:
   - Click "Import Data" in settings
   - Select a JSON file with project data
   - System validates and imports the data

2. **Export Data**:
   - Click "Export Data" in settings
   - Downloads a complete backup of all projects
   - Useful for migration or backup

3. **Cache Management**:
   - Click "Clear Cache" to force fresh data loading
   - Useful when changes aren't immediately visible

## Security Features

### 1. Authentication
- Password-protected admin access
- Session-based authentication
- Secure password storage (localStorage)

### 2. Token Security
- **No hardcoded tokens**: Tokens never committed to version control
- **Secure storage**: Token stored in browser localStorage
- **Validation**: Token tested before use
- **Environment variables**: Support for deployment environments

### 3. Data Validation
- Input sanitization and validation
- JSON schema validation
- File type and size restrictions
- XSS protection through HTML escaping

### 4. API Security
- GitHub token-based authentication
- Repository access control
- Rate limiting and error handling
- Secure HTTPS connections

## Performance Optimization

### 1. Caching Strategy
- Local storage caching for projects
- GitHub API response caching
- Image lazy loading

### 2. Loading Optimization
- Progressive loading of project cards
- Loading states and error handling
- Debounced scroll events

### 3. Asset Optimization
- Image compression and optimization
- Lazy loading for off-screen content
- Minified CSS and JavaScript

## Troubleshooting

### Common Issues

1. **GitHub Secret Scanning Warning**:
   - **Cause**: Hardcoded tokens in code
   - **Solution**: Use admin panel to configure token
   - **Prevention**: Never commit tokens to version control

2. **Resource Not Accessible by Token**:
   - **Cause**: Token lacks `repo` scope or incorrect repository configuration
   - **Solution**: 
     - Create token with `repo` scope
     - Verify repository exists and you have access
     - Check username/repository name in API configuration
   - **Prevention**: Always verify token scopes and repository access

3. **Can Create Drafts but Publishing Fails**:
   - **Cause**: Branch configuration mismatch
   - **Solution**: 
     - System now auto-detects repository branch
     - Reconfigure token in admin panel
     - Try publishing again
   - **Prevention**: System automatically handles branch detection

4. **Cannot read properties of undefined (reading 'toLowerCase')**:
   - **Cause**: Project ID generation fails when title is undefined
   - **Solution**: 
     - System now uses safe ID generation with fallbacks
     - Enhanced error handling prevents JavaScript errors
     - Multiple fallback strategy ensures compatibility
   - **Prevention**: System automatically handles undefined values

5. **404/403 API Errors**:
   - **Cause**: Repository doesn't exist or token lacks permissions
   - **Solution**:
     - Verify repository exists and is accessible
     - Ensure token has `repo` scope (not just `public_repo`)
     - Check repository name and username configuration
   - **Prevention**: Enhanced error handling provides clear guidance

6. **Projects Not Loading**:
   - Check GitHub token configuration in admin panel
   - Verify repository name and owner
   - Ensure projects.json exists and is valid
   - Check browser console for error messages

7. **Admin Login Issues**:
   - Verify password configuration
   - Check browser console for errors
   - Clear localStorage and retry

8. **Image Upload Problems**:
   - Verify GitHub token has necessary permissions
   - Check file size and type restrictions
   - Ensure proper image format
   - Check admin panel token status

9. **Token Configuration Issues**:
   - Ensure token has `repo` scope
   - Verify token hasn't expired
   - Check for typos in token entry
   - Use admin panel to test token

### Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Graceful fallbacks for API failures
- **Data Errors**: Validation and user feedback
- **UI Errors**: Loading states and error messages
- **Console Logging**: Detailed error information for debugging
- **Token Errors**: Clear token configuration guidance

## Security Best Practices

### 1. Token Management
- **Never commit tokens** to version control
- **Use admin panel** for token configuration
- **Regenerate tokens** if compromised
- **Use minimal scopes** (only `repo` needed)
- **Monitor token usage** in GitHub settings

### 2. Repository Security
- **Keep repository private** if sensitive
- **Use strong password** for admin panel
- **Regular token rotation** (every 90 days)
- **Monitor access logs** in GitHub
- **Enable two-factor authentication** on GitHub

### 3. Code Security
- **Validate all inputs** before processing
- **Escape HTML content** to prevent XSS
- **Use HTTPS** for all connections
- **Sanitize file uploads** and validate types
- **Implement rate limiting** for API calls

## Customization

### 1. Styling
- Modify `css/style.css` for main portfolio styling
- Update `admin/css/admin.css` for admin interface
- Use CSS custom properties for theming

### 2. Functionality
- Extend `js/github-api.js` for additional API features
- Modify `js/script.js` for portfolio behavior
- Update admin functionality in `admin/js/admin-main.js`

### 3. Data Structure
- Add new fields to `data/projects.json` schema
- Update validation rules in GitHub API
- Modify admin form to accommodate new fields

## Future Enhancements

### Planned Features

1. **Advanced Admin Features**:
   - User management and roles
   - Project analytics and statistics
   - Automated SEO optimization
   - Advanced image editing

2. **GitHub Actions Automation**:
   - Automated deployment
   - Image optimization workflows
   - Data validation and testing
   - Automated backups

3. **Extended Functionality**:
   - Blog post management
   - Skill/experience management
   - Contact form integration
   - Multi-language support

### Technical Improvements

1. **Performance**:
   - Service worker implementation
   - Advanced caching strategies
   - Code splitting and lazy loading
   - Image CDN integration

2. **Security**:
   - JWT-based authentication
   - CSRF protection
   - Input sanitization improvements
   - Audit logging

## Support

For issues, questions, or contributions:

1. **GitHub Issues**: Report bugs or request features
2. **Documentation**: Check inline code comments
3. **Community**: Join discussions in the repository

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Modern web technologies and best practices
- GitHub API for content management
- Open source libraries and frameworks
- Community contributions and feedback

---

**🔐 Security Reminder**: Never commit GitHub tokens or sensitive credentials to version control. Always use admin panel for secure token management.

**📝 Note**: This is a comprehensive CMS system built with modern web technologies and security best practices. Regular updates and maintenance are recommended to ensure security and performance.
