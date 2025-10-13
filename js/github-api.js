// GitHub API Integration for Project Management
class GitHubAPI {
    constructor() {
        // Use environment variable for token, fallback for development
        this.token = this.getGitHubToken();
        this.username = 'stalker-doge';
        this.repo = 'NewPortfolio';
        this.branch = 'main';
        this.baseUrl = 'https://api.github.com';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    }

    // Get GitHub token from environment variable or configuration
    getGitHubToken() {
        // Try to get from environment variable (for GitHub Pages deployment)
        if (typeof window !== 'undefined' && window.GITHUB_TOKEN) {
            return window.GITHUB_TOKEN;
        }
        
        // Try to get from localStorage (for admin interface)
        if (typeof localStorage !== 'undefined') {
            const storedToken = localStorage.getItem('github_token');
            if (storedToken) {
                return storedToken;
            }
        }
        
        // For development - show warning
        if (typeof console !== 'undefined') {
            console.warn('GitHub token not found. Please configure token in one of these ways:');
            console.warn('1. For GitHub Pages: Set GITHUB_TOKEN environment variable');
            console.warn('2. For admin interface: Set token in localStorage with key "github_token"');
            console.warn('3. For development: Set window.GITHUB_TOKEN before initializing');
        }
        
        return null;
    }

    // Check if token is available and valid
    isAuthenticated() {
        return this.token && this.token.length > 0;
    }

    // Generic API request method
    async apiRequest(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('GitHub token not configured. Please check setup instructions.');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, { ...options, headers });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('GitHub API Request Failed:', error);
            throw error;
        }
    }

    // Get file content from repository
    async getFileContent(path) {
        const cacheKey = `file:${path}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const endpoint = `/repos/${this.username}/${this.repo}/contents/${path}`;
            const response = await this.apiRequest(endpoint);
            
            if (response.type === 'file') {
                const content = atob(response.content);
                const data = {
                    content: content,
                    sha: response.sha,
                    size: response.size
                };
                
                this.cache.set(cacheKey, { data, timestamp: Date.now() });
                return data;
            } else {
                throw new Error(`Expected file but got ${response.type}`);
            }
        } catch (error) {
            if (error.message.includes('404')) {
                // File not found, return default structure
                return { content: '{"projects": []}', sha: null, size: 0 };
            }
            throw error;
        }
    }

    // Update or create file in repository
    async updateFileContent(path, content, message = 'Update projects data') {
        try {
            const endpoint = `/repos/${this.username}/${this.repo}/contents/${path}`;
            
            // Get current file to get SHA
            let currentFile;
            try {
                currentFile = await this.getFileContent(path);
            } catch (error) {
                if (!error.message.includes('404')) {
                    throw error;
                }
                // File doesn't exist, create new
                currentFile = { sha: null };
            }

            const encodedContent = btoa(content);
            const body = {
                message: message,
                content: encodedContent,
                branch: this.branch
            };

            if (currentFile.sha) {
                body.sha = currentFile.sha;
            }

            const response = await this.apiRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify(body)
            });

            // Clear cache
            this.cache.delete(`file:${path}`);
            
            return {
                success: true,
                sha: response.content.sha,
                url: response.content.download_url
            };
        } catch (error) {
            console.error('Failed to update file:', error);
            throw error;
        }
    }

    // Upload image to repository
    async uploadImage(projectId, imageFile, imageName) {
        try {
            const path = `assets/projects/${projectId}/${imageName}`;
            const reader = new FileReader();
            
            return new Promise((resolve, reject) => {
                reader.onload = async (e) => {
                    try {
                        const base64Content = e.target.result.split(',')[1]; // Remove data URL prefix
                        
                        const endpoint = `/repos/${this.username}/${this.repo}/contents/${path}`;
                        
                        // Check if file exists
                        let sha = null;
                        try {
                            const existingFile = await this.getFileContent(path);
                            sha = existingFile.sha;
                        } catch (error) {
                            // File doesn't exist, that's fine
                        }

                        const body = {
                            message: `Upload image ${imageName} for project ${projectId}`,
                            content: base64Content,
                            branch: this.branch
                        };

                        if (sha) {
                            body.sha = sha;
                        }

                        const response = await this.apiRequest(endpoint, {
                            method: 'PUT',
                            body: JSON.stringify(body)
                        });

                        resolve({
                            success: true,
                            url: response.content.download_url,
                            path: path,
                            sha: response.content.sha
                        });
                    } catch (error) {
                        reject(error);
                    }
                };
                
                reader.onerror = () => reject(new Error('Failed to read image file'));
                reader.readAsDataURL(imageFile);
            });
        } catch (error) {
            console.error('Failed to upload image:', error);
            throw error;
        }
    }

    // Delete image from repository
    async deleteImage(path, message = 'Delete image') {
        try {
            const endpoint = `/repos/${this.username}/${this.repo}/contents/${path}`;
            
            // Get current file SHA
            const currentFile = await this.getFileContent(path);
            
            if (!currentFile.sha) {
                throw new Error('File not found');
            }

            await this.apiRequest(endpoint, {
                method: 'DELETE',
                body: JSON.stringify({
                    message: message,
                    sha: currentFile.sha,
                    branch: this.branch
                })
            });

            return { success: true };
        } catch (error) {
            console.error('Failed to delete image:', error);
            throw error;
        }
    }

    // Get projects data
    async getProjects() {
        try {
            const fileData = await this.getFileContent('data/projects.json');
            const projectsData = JSON.parse(fileData.content);
            return projectsData.projects || [];
        } catch (error) {
            console.error('Failed to get projects:', error);
            return [];
        }
    }

    // Save projects data
    async saveProjects(projects, message = 'Update projects') {
        try {
            const projectsData = {
                projects: projects,
                lastUpdated: new Date().toISOString()
            };
            
            const content = JSON.stringify(projectsData, null, 2);
            return await this.updateFileContent('data/projects.json', content, message);
        } catch (error) {
            console.error('Failed to save projects:', error);
            throw error;
        }
    }

    // Add new project
    async addProject(projectData) {
        try {
            const projects = await this.getProjects();
            
            // Generate ID if not provided
            if (!projectData.id) {
                projectData.id = this.generateId(projectData.title);
            }
            
            // Set timestamps
            projectData.status = projectData.status || 'draft';
            projectData.publishDate = projectData.publishDate || new Date().toISOString().split('T')[0];
            projectData.lastModified = new Date().toISOString();
            
            projects.push(projectData);
            
            const result = await this.saveProjects(projects, `Add project: ${projectData.title}`);
            return { success: true, project: projectData, result };
        } catch (error) {
            console.error('Failed to add project:', error);
            throw error;
        }
    }

    // Update existing project
    async updateProject(projectId, updatedData) {
        try {
            const projects = await this.getProjects();
            const projectIndex = projects.findIndex(p => p.id === projectId);
            
            if (projectIndex === -1) {
                throw new Error('Project not found');
            }
            
            // Preserve some fields and update others
            const originalProject = projects[projectIndex];
            updatedData.id = projectId; // Ensure ID doesn't change
            updatedData.lastModified = new Date().toISOString();
            
            // Merge with existing data
            projects[projectIndex] = { ...originalProject, ...updatedData };
            
            const result = await this.saveProjects(projects, `Update project: ${updatedData.title || projectId}`);
            return { success: true, project: projects[projectIndex], result };
        } catch (error) {
            console.error('Failed to update project:', error);
            throw error;
        }
    }

    // Delete project
    async deleteProject(projectId) {
        try {
            const projects = await this.getProjects();
            const projectIndex = projects.findIndex(p => p.id === projectId);
            
            if (projectIndex === -1) {
                throw new Error('Project not found');
            }
            
            const deletedProject = projects[projectIndex];
            projects.splice(projectIndex, 1);
            
            const result = await this.saveProjects(projects, `Delete project: ${deletedProject.title}`);
            return { success: true, deletedProject, result };
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    }

    // Generate URL-friendly ID from title
    generateId(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Validate project data
    validateProject(projectData) {
        const required = ['title', 'description', 'category'];
        const errors = [];

        required.forEach(field => {
            if (!projectData[field] || (Array.isArray(projectData[field]) && projectData[field].length === 0)) {
                errors.push(`${field} is required`);
            }
        });

        if (projectData.links && typeof projectData.links !== 'object') {
            errors.push('links must be an object');
        }

        if (projectData.technologies && !Array.isArray(projectData.technologies)) {
            errors.push('technologies must be an array');
        }

        if (projectData.features && !Array.isArray(projectData.features)) {
            errors.push('features must be an array');
        }

        return errors;
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get repository info
    async getRepositoryInfo() {
        try {
            const endpoint = `/repos/${this.username}/${this.repo}`;
            return await this.apiRequest(endpoint);
        } catch (error) {
            console.error('Failed to get repository info:', error);
            throw error;
        }
    }
}

// Create global instance
window.githubAPI = new GitHubAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}
