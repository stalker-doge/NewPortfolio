// Admin Main JavaScript - Project Management System

// Global State Management
class AdminState {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.isLoading = false;
        this.error = null;
        this.isAuthenticated = false;
        this.currentView = 'projects';
        this.uploadedImages = new Map(); // Track uploaded images
        this.deletedImages = new Set(); // Track images to delete
    }

    reset() {
        this.projects = [];
        this.currentProject = null;
        this.isLoading = false;
        this.error = null;
        this.uploadedImages.clear();
        this.deletedImages.clear();
    }
}

// Toast Notification System
class ToastManager {
    static show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getIcon(type);
        const messageElement = document.createElement('span');
        messageElement.className = 'toast-message';
        messageElement.textContent = message;

        toast.innerHTML = icon;
        toast.appendChild(messageElement);

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out';
        }, 10);

        // Remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    static getIcon(type) {
        const icons = {
            success: '<span class="toast-icon">✓</span>',
            error: '<span class="toast-icon">✗</span>',
            warning: '<span class="toast-icon">⚠</span>',
            info: '<span class="toast-icon">ℹ</span>'
        };
        return icons[type] || icons.info;
    }

    static success(message, duration) {
        this.show(message, 'success', duration);
    }

    static error(message, duration) {
        this.show(message, 'error', duration);
    }

    static warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    static info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Admin Application Controller
class AdminApp {
    constructor() {
        this.state = new AdminState();
        this.githubAPI = window.githubAPI;
        this.adminPassword = 'portfolio2024'; // Change this to your desired password
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.setupTabNavigation();
        this.setupProjectForm();
        this.setupImageUploads();
        this.setupTagInputs();
        this.setupFeatureList();
        this.setupChallengesList();
        this.setupTokenManagement();
    }

    // Authentication System
    checkAuthentication() {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (isAuthenticated === 'true') {
            this.state.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    async login(password) {
        if (password === this.adminPassword) {
            localStorage.setItem('adminAuthenticated', 'true');
            this.state.isAuthenticated = true;
            this.showDashboard();
            ToastManager.success('Login successful!');
            await this.loadProjects();
        } else {
            ToastManager.error('Invalid password');
            return false;
        }
        return true;
    }

    logout() {
        localStorage.removeItem('adminAuthenticated');
        this.state.isAuthenticated = false;
        this.state.reset();
        this.showLogin();
        ToastManager.info('Logged out successfully');
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        this.switchView('projects');
    }

    // GitHub Token Management
    setupTokenManagement() {
        const tokenForm = document.getElementById('tokenForm');
        const tokenInput = document.getElementById('githubToken');
        const saveTokenBtn = document.getElementById('saveTokenBtn');
        const tokenStatus = document.getElementById('tokenStatus');

        if (tokenForm) {
            tokenForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveGitHubToken();
            });
        }

        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', async () => {
                await this.saveGitHubToken();
            });
        }

        // Update token status on load
        this.updateTokenStatus();
    }

    async saveGitHubToken() {
        const tokenInput = document.getElementById('githubToken');
        const token = tokenInput ? tokenInput.value.trim() : '';

        if (!token) {
            ToastManager.error('Please enter a GitHub token');
            return;
        }

        try {
            // Test the token by making a simple API call
            localStorage.setItem('github_token', token);
            
            // Clear the current GitHub API instance and create a new one
            this.githubAPI = new GitHubAPI();
            
            // Test the token by getting repository info
            await this.githubAPI.getRepositoryInfo();
            
            this.updateTokenStatus();
            ToastManager.success('GitHub token saved successfully!');
            
            // Reload projects to test the connection
            await this.loadProjects();
            
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('github_token');
            this.updateTokenStatus();
            
            // Provide specific error message based on the error
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                ToastManager.error('Repository not found. Check username/repository name in API configuration.');
            } else if (error.message.includes('401') || error.message.includes('Bad credentials')) {
                ToastManager.error('Invalid GitHub token. Please check and try again.');
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                ToastManager.error('Token lacks necessary permissions. Ensure token has "repo" scope.');
            } else {
                ToastManager.error(`GitHub token error: ${error.message}`);
            }
        }
    }

    updateTokenStatus() {
        const tokenStatus = document.getElementById('tokenStatus');
        const tokenInput = document.getElementById('githubToken');
        
        if (!tokenStatus) return;

        const storedToken = localStorage.getItem('github_token');
        
        if (storedToken) {
            tokenStatus.textContent = 'Token: Configured ✓';
            tokenStatus.className = 'token-status configured';
            if (tokenInput) {
                tokenInput.value = storedToken;
            }
        } else {
            tokenStatus.textContent = 'Token: Not configured';
            tokenStatus.className = 'token-status not-configured';
            if (tokenInput) {
                tokenInput.value = '';
            }
        }
    }

    // View Management
    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.admin-view').forEach(view => {
            view.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected view
        const selectedView = document.getElementById(`${viewName}View`);
        if (selectedView) {
            selectedView.classList.add('active');
        }

        // Add active class to clicked nav button
        const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.state.currentView = viewName;

        // Load view-specific data
        if (viewName === 'projects') {
            this.loadProjects();
        } else if (viewName === 'settings') {
            this.loadSettings();
        }
    }

    // Project Management
    async loadProjects() {
        if (this.state.isLoading) return;

        this.setLoading(true);
        this.clearError();

        try {
            this.state.projects = await this.githubAPI.getProjects();
            this.renderProjects();
            ToastManager.success('Projects loaded successfully');
        } catch (error) {
            this.setError('Failed to load projects: ' + error.message);
            ToastManager.error('Failed to load projects');
        } finally {
            this.setLoading(false);
        }
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.state.projects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h3>No Projects Yet</h3>
                    <p>Click "Add New Project" to create your first project.</p>
                </div>
            `;
            return;
        }

        this.state.projects.forEach(project => {
            const card = this.createProjectCard(project);
            grid.appendChild(card);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = `project-card-admin ${project.featured ? 'featured' : ''}`;
        
        const statusClass = project.status === 'published' ? 'published' : 'draft';
        
        card.innerHTML = `
            <div class="project-status ${statusClass}">${project.status}</div>
            <h3 class="project-title-admin">${this.escapeHtml(project.title)}</h3>
            ${project.subtitle ? `<p class="project-subtitle-admin">${this.escapeHtml(project.subtitle)}</p>` : ''}
            <p class="project-description-admin">${this.escapeHtml(project.description)}</p>
            <div class="project-categories">
                ${project.category.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
            <div class="project-actions">
                <button class="btn btn-small btn-secondary" onclick="adminApp.editProject('${project.id}')">
                    Edit
                </button>
                <button class="btn btn-small btn-secondary" onclick="adminApp.confirmDeleteProject('${project.id}')">
                    Delete
                </button>
                <button class="btn btn-small btn-primary" onclick="adminApp.toggleProjectStatus('${project.id}')">
                    ${project.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
            </div>
        `;

        return card;
    }

    async addProject(projectData) {
        this.setLoading(true);
        
        try {
            // Upload any new images first
            await this.uploadProjectImages(projectData);
            
            // Add project to GitHub
            const result = await this.githubAPI.addProject(projectData);
            
            // Clear uploaded images tracking
            this.state.uploadedImages.clear();
            
            // Reload projects
            await this.loadProjects();
            
            ToastManager.success('Project added successfully!');
            return result;
        } catch (error) {
            ToastManager.error('Failed to add project: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async updateProject(projectId, updatedData) {
        this.setLoading(true);
        
        try {
            // Upload any new images first
            await this.uploadProjectImages(updatedData);
            
            // Delete any removed images
            await this.deleteProjectImages();
            
            // Update project in GitHub
            const result = await this.githubAPI.updateProject(projectId, updatedData);
            
            // Clear tracking
            this.state.uploadedImages.clear();
            this.state.deletedImages.clear();
            
            // Reload projects
            await this.loadProjects();
            
            ToastManager.success('Project updated successfully!');
            return result;
        } catch (error) {
            ToastManager.error('Failed to update project: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async deleteProject(projectId) {
        this.setLoading(true);
        
        try {
            const result = await this.githubAPI.deleteProject(projectId);
            
            // Reload projects
            await this.loadProjects();
            
            ToastManager.success('Project deleted successfully!');
            return result;
        } catch (error) {
            ToastManager.error('Failed to delete project: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async toggleProjectStatus(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        const newStatus = project.status === 'published' ? 'draft' : 'published';
        
        try {
            await this.updateProject(projectId, { status: newStatus });
        } catch (error) {
            console.error('Failed to toggle project status:', error);
        }
    }

    // Project Form Management
    openProjectModal(project = null) {
        this.state.currentProject = project;
        this.state.uploadedImages.clear();
        this.state.deletedImages.clear();

        const modal = document.getElementById('projectModal');
        const title = document.getElementById('modalTitle');
        
        if (project) {
            title.textContent = 'Edit Project';
            this.populateProjectForm(project);
        } else {
            title.textContent = 'Add New Project';
            this.clearProjectForm();
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    populateProjectForm(project) {
        // Basic Info Tab
        document.getElementById('projectTitle').value = project.title || '';
        document.getElementById('projectSubtitle').value = project.subtitle || '';
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('projectStatus').value = project.status || 'draft';
        document.getElementById('projectFeatured').value = project.featured ? 'true' : 'false';
        document.getElementById('projectPublishDate').value = project.publishDate || '';

        // Categories
        document.querySelectorAll('input[name="category"]').forEach(checkbox => {
            checkbox.checked = project.category && project.category.includes(checkbox.value);
        });

        // Content Tab
        this.populateTags('techTags', project.technologies || []);
        this.populateFeatures(project.features || []);
        
        if (project.links) {
            document.getElementById('demoLink').value = project.links.demo || '';
            document.getElementById('githubLink').value = project.links.github || '';
            document.getElementById('downloadLink').value = project.links.download || '';
        }

        // Media Tab
        this.populateImagePreview('heroImagePreview', project.images?.hero);
        this.populateImagePreview('thumbnailImagePreview', project.images?.thumbnail);
        this.populateGallery(project.images?.gallery || []);

        // Advanced Tab
        if (project.stats) {
            document.getElementById('devTime').value = project.stats.developmentTime || '';
            document.getElementById('teamSize').value = project.stats.teamSize || '';
            document.getElementById('codeLines').value = project.stats.linesOfCode || '';
        }

        this.populateChallenges(project.challenges || []);

        if (project.seo) {
            document.getElementById('metaTitle').value = project.seo.metaTitle || '';
            document.getElementById('metaDescription').value = project.seo.metaDescription || '';
            this.populateTags('keywordTags', project.seo.keywords || []);
        }
    }

    clearProjectForm() {
        document.getElementById('projectForm').reset();
        
        // Clear dynamic content
        document.getElementById('techTags').innerHTML = '';
        document.getElementById('featuresList').innerHTML = '';
        document.getElementById('galleryImages').innerHTML = '';
        document.getElementById('challengesList').innerHTML = '';
        document.getElementById('keywordTags').innerHTML = '';
        
        // Clear image previews
        document.getElementById('heroImagePreview').innerHTML = '';
        document.getElementById('heroImagePreview').classList.remove('has-image');
        document.getElementById('thumbnailImagePreview').innerHTML = '';
        document.getElementById('thumbnailImagePreview').classList.remove('has-image');
    }

    async saveProject() {
        const formData = this.collectProjectFormData();
        
        // Validate form data
        const errors = this.githubAPI.validateProject(formData);
        if (errors.length > 0) {
            ToastManager.error('Validation errors: ' + errors.join(', '));
            return;
        }

        try {
            if (this.state.currentProject) {
                await this.updateProject(this.state.currentProject.id, formData);
            } else {
                await this.addProject(formData);
            }
            
            closeProjectModal();
        } catch (error) {
            console.error('Failed to save project:', error);
        }
    }

    collectProjectFormData() {
        const categories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
            .map(cb => cb.value);

        const technologies = this.getTagsFromContainer('techTags');
        const features = this.getFeaturesFromList();
        const keywords = this.getTagsFromContainer('keywordTags');
        const challenges = this.getChallengesFromList();

        const projectData = {
            title: document.getElementById('projectTitle').value,
            subtitle: document.getElementById('projectSubtitle').value,
            description: document.getElementById('projectDescription').value,
            status: document.getElementById('projectStatus').value,
            featured: document.getElementById('projectFeatured').value === 'true',
            publishDate: document.getElementById('projectPublishDate').value,
            category: categories,
            technologies: technologies,
            features: features,
            links: {
                demo: document.getElementById('demoLink').value,
                github: document.getElementById('githubLink').value,
                download: document.getElementById('downloadLink').value
            },
            images: {
                hero: this.getImageData('heroImagePreview'),
                thumbnail: this.getImageData('thumbnailImagePreview'),
                gallery: this.getGalleryData()
            },
            stats: {
                developmentTime: document.getElementById('devTime').value,
                teamSize: document.getElementById('teamSize').value,
                linesOfCode: document.getElementById('codeLines').value
            },
            challenges: challenges,
            seo: {
                metaTitle: document.getElementById('metaTitle').value,
                metaDescription: document.getElementById('metaDescription').value,
                keywords: keywords
            }
        };

        return projectData;
    }

    // Image Management
    async uploadProjectImages(projectData) {
        const projectId = projectData.id || this.githubAPI.generateId(projectData.title);
        
        // Upload hero image
        const heroFile = document.getElementById('heroImage').files[0];
        if (heroFile) {
            const result = await this.githubAPI.uploadImage(projectId, heroFile, 'hero.jpg');
            projectData.images.hero = result.path;
        }

        // Upload thumbnail image
        const thumbnailFile = document.getElementById('thumbnailImage').files[0];
        if (thumbnailFile) {
            const result = await this.githubAPI.uploadImage(projectId, thumbnailFile, 'thumbnail.jpg');
            projectData.images.thumbnail = result.path;
        }

        // Upload gallery images
        const galleryFiles = document.getElementById('galleryImageInput').files;
        for (let i = 0; i < galleryFiles.length; i++) {
            const file = galleryFiles[i];
            const result = await this.githubAPI.uploadImage(projectId, file, `gallery-${Date.now()}-${i}.jpg`);
            
            if (!projectData.images.gallery) {
                projectData.images.gallery = [];
            }
            projectData.images.gallery.push({
                url: result.path,
                caption: `Gallery image ${i + 1}`
            });
        }
    }

    async deleteProjectImages() {
        for (const imagePath of this.state.deletedImages) {
            try {
                await this.githubAPI.deleteImage(imagePath);
            } catch (error) {
                console.error('Failed to delete image:', imagePath, error);
            }
        }
    }

    populateImagePreview(previewId, imagePath) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        if (imagePath) {
            preview.innerHTML = `<img src="${imagePath}" alt="Preview">`;
            preview.classList.add('has-image');
        } else {
            preview.innerHTML = '';
            preview.classList.remove('has-image');
        }
    }

    getImageData(previewId) {
        const preview = document.getElementById(previewId);
        const img = preview.querySelector('img');
        return img ? img.src : '';
    }

    populateGallery(galleryItems) {
        const container = document.getElementById('galleryImages');
        if (!container) return;

        container.innerHTML = '';
        galleryItems.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${item.url}" alt="${item.caption || ''}">
                <button type="button" class="remove-gallery" onclick="adminApp.removeGalleryImage(${index})">×</button>
            `;
            container.appendChild(galleryItem);
        });
    }

    getGalleryData() {
        const galleryItems = [];
        const container = document.getElementById('galleryImages');
        const images = container.querySelectorAll('img');
        
        images.forEach(img => {
            galleryItems.push({
                url: img.src,
                caption: img.alt || ''
            });
        });
        
        return galleryItems;
    }

    removeGalleryImage(index) {
        const container = document.getElementById('galleryImages');
        const galleryItems = container.querySelectorAll('.gallery-item');
        
        if (galleryItems[index]) {
            const img = galleryItems[index].querySelector('img');
            if (img.src) {
                this.state.deletedImages.add(img.src);
            }
            galleryItems[index].remove();
        }
    }

    // Tag Management
    populateTags(containerId, tags) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${this.escapeHtml(tag)}
                <span class="remove-tag" onclick="this.parentElement.remove()">×</span>
            `;
            container.appendChild(tagElement);
        });
    }

    getTagsFromContainer(containerId) {
        const container = document.getElementById(containerId);
        const tags = [];
        
        container.querySelectorAll('.tag').forEach(tagElement => {
            const text = tagElement.textContent.replace('×', '').trim();
            if (text) {
                tags.push(text);
            }
        });
        
        return tags;
    }

    addTag(inputId, containerId) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);
        
        if (!input || !container) return;        
        
        const tagText = input.value.trim();
        if (tagText) {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${this.escapeHtml(tagText)}
                <span class="remove-tag" onclick="this.parentElement.remove()">×</span>
            `;
            container.appendChild(tagElement);
            input.value = '';
        }
    }

    // Feature Management
    populateFeatures(features) {
        const container = document.getElementById('featuresList');
        if (!container) return;

        container.innerHTML = '';
        features.forEach((feature, index) => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.innerHTML = `
                <span class="feature-text">${this.escapeHtml(feature)}</span>
                <div class="feature-actions">
                    <button type="button" class="btn-icon" onclick="adminApp.editFeature(${index})">✏️</button>
                    <button type="button" class="btn-icon" onclick="adminApp.removeFeature(${index})">🗑️</button>
                </div>
            `;
            container.appendChild(featureItem);
        });
    }

    getFeaturesFromList() {
        const features = [];
        const container = document.getElementById('featuresList');
        
        container.querySelectorAll('.feature-text').forEach(textElement => {
            const text = textElement.textContent.trim();
            if (text) {
                features.push(text);
            }
        });
        
        return features;
    }

    addFeature() {
        const featureText = prompt('Enter feature description:');
        if (featureText && featureText.trim()) {
            const container = document.getElementById('featuresList');
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.innerHTML = `
                <span class="feature-text">${this.escapeHtml(featureText.trim())}</span>
                <div class="feature-actions">
                    <button type="button" class="btn-icon" onclick="adminApp.editFeature(${container.children.length})">✏️</button>
                    <button type="button" class="btn-icon" onclick="adminApp.removeFeature(${container.children.length})">🗑️</button>
                </div>
            `;
            container.appendChild(featureItem);
        }
    }

    editFeature(index) {
        const container = document.getElementById('featuresList');
        const featureItems = container.querySelectorAll('.feature-text');
        
        if (featureItems[index]) {
            const currentText = featureItems[index].textContent;
            const newText = prompt('Edit feature:', currentText);
            
            if (newText !== null && newText.trim()) {
                featureItems[index].textContent = newText.trim();
            }
        }
    }

    removeFeature(index) {
        const container = document.getElementById('featuresList');
        const featureItems = container.querySelectorAll('.feature-item');
        
        if (featureItems[index]) {
            featureItems[index].remove();
        }
    }

    // Challenges Management
    populateChallenges(challenges) {
        const container = document.getElementById('challengesList');
        if (!container) return;

        container.innerHTML = '';
        challenges.forEach((challenge, index) => {
            const challengeItem = document.createElement('div');
            challengeItem.className = 'challenge-item';
            challengeItem.innerHTML = `
                <input type="text" class="challenge-input" value="${this.escapeHtml(challenge.challenge)}" placeholder="Challenge description">
                <textarea class="solution-input" placeholder="Solution">${this.escapeHtml(challenge.solution)}</textarea>
                <div class="feature-actions">
                    <button type="button" class="btn-icon" onclick="adminApp.removeChallenge(${index})">🗑️</button>
                </div>
            `;
            container.appendChild(challengeItem);
        });
    }

    getChallengesFromList() {
        const challenges = [];
        const container = document.getElementById('challengesList');
        const challengeItems = container.querySelectorAll('.challenge-item');
        
        challengeItems.forEach(item => {
            const challenge = item.querySelector('.challenge-input').value.trim();
            const solution = item.querySelector('.solution-input').value.trim();
            
            if (challenge && solution) {
                challenges.push({ challenge, solution });
            }
        });
        
        return challenges;
    }

    addChallenge() {
        const container = document.getElementById('challengesList');
        const challengeItem = document.createElement('div');
        challengeItem.className = 'challenge-item';
        challengeItem.innerHTML = `
            <input type="text" class="challenge-input" placeholder="Challenge description">
            <textarea class="solution-input" placeholder="Solution"></textarea>
            <div class="feature-actions">
                <button type="button" class="btn-icon" onclick="adminApp.removeChallenge(${container.children.length})">🗑️</button>
            </div>
        `;
        container.appendChild(challengeItem);
    }

    removeChallenge(index) {
        const container = document.getElementById('challengesList');
        const challengeItems = container.querySelectorAll('.challenge-item');
        
        if (challengeItems[index]) {
            challengeItems[index].remove();
        }
    }

    // Settings Management
    async loadSettings() {
        try {
            const repoInfo = await this.githubAPI.getRepositoryInfo();
            document.getElementById('repoInfo').textContent = `${repoInfo.full_name}`;
            document.getElementById('apiStatus').textContent = 'Online';
            document.getElementById('apiStatus').className = 'status-online';
        } catch (error) {
            document.getElementById('repoInfo').textContent = 'Error loading';
            document.getElementById('apiStatus').textContent = 'Offline';
            document.getElementById('apiStatus').className = 'status-offline';
        }

        document.getElementById('totalProjects').textContent = this.state.projects.length;
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
    }

    async clearCache() {
        try {
            this.githubAPI.clearCache();
            ToastManager.success('Cache cleared successfully');
        } catch (error) {
            ToastManager.error('Failed to clear cache');
        }
    }

    exportData() {
        const dataStr = JSON.stringify({
            projects: this.state.projects,
            exported: new Date().toISOString()
        }, null, 2);
        
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `projects-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        ToastManager.success('Data exported successfully');
    }

    importData() {
        document.getElementById('importFile').click();
    }

    async handleImportFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.projects && Array.isArray(data.projects)) {
                // Validate projects before importing
                for (const project of data.projects) {
                    const errors = this.githubAPI.validateProject(project);
                    if (errors.length > 0) {
                        throw new Error(`Invalid project data: ${errors.join(', ')}`);
                    }
                }
                
                // Save imported projects
                await this.githubAPI.saveProjects(data.projects, 'Import projects data');
                await this.loadProjects();
                
                ToastManager.success(`Successfully imported ${data.projects.length} projects`);
            } else {
                throw new Error('Invalid import file format');
            }
        } catch (error) {
            ToastManager.error('Import failed: ' + error.message);
        }
    }

    // UI State Management
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        const loadingState = document.getElementById('loadingState');
        const projectsGrid = document.getElementById('projectsGrid');
        
        if (isLoading) {
            if (loadingState) loadingState.style.display = 'block';
            if (projectsGrid) projectsGrid.style.display = 'none';
        } else {
            if (loadingState) loadingState.style.display = 'none';
            if (projectsGrid) projectsGrid.style.display = 'grid';
        }
    }

    setError(message) {
        this.state.error = message;
        
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        const projectsGrid = document.getElementById('projectsGrid');
        
        if (errorState) {
            errorState.style.display = 'block';
            if (errorMessage) errorMessage.textContent = message;
        }
        
        if (projectsGrid) {
            projectsGrid.style.display = 'none';
        }
    }

    clearError() {
        this.state.error = null;
        
        const errorState = document.getElementById('errorState');
        if (errorState) {
            errorState.style.display = 'none';
        }
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const password = document.getElementById('adminPassword').value;
                await this.login(password);
            });
        }

        // Navigation
        document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Project management
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.openProjectModal();
            });
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadProjects();
            });
        }

        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadProjects();
            });
        }

        // Settings
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }

        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                this.importData();
            });
        }

        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImportFile(file);
                }
            });
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const targetContent = document.querySelector(`.tab-content[data-tab="${targetTab}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    setupProjectForm() {
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProject();
            });
        }
    }

    setupImageUploads() {
        // Hero image
        const heroImage = document.getElementById('heroImage');
        if (heroImage) {
            heroImage.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'heroImagePreview');
            });
        }

        // Thumbnail image
        const thumbnailImage = document.getElementById('thumbnailImage');
        if (thumbnailImage) {
            thumbnailImage.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'thumbnailImagePreview');
            });
        }

        // Gallery images
        const galleryImageInput = document.getElementById('galleryImageInput');
        const addGalleryImageBtn = document.getElementById('addGalleryImageBtn');
        
        if (addGalleryImageBtn) {
            addGalleryImageBtn.addEventListener('click', () => {
                galleryImageInput.click();
            });
        }

        if (galleryImageInput) {
            galleryImageInput.addEventListener('change', (e) => {
                this.handleGalleryUpload(e);
            });
        }
    }

    setupTagInputs() {
        // Technology tags
        const techInput = document.getElementById('techInput');
        if (techInput) {
            techInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag('techInput', 'techTags');
                }
            });
        }

        // Keyword tags
        const keywordInput = document.getElementById('keywordInput');
        if (keywordInput) {
            keywordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag('keywordInput', 'keywordTags');
                }
            });
        }
    }

    setupFeatureList() {
        const addFeatureBtn = document.getElementById('addFeatureBtn');
        if (addFeatureBtn) {
            addFeatureBtn.addEventListener('click', () => {
                this.addFeature();
            });
        }
    }

    setupChallengesList() {
        const addChallengeBtn = document.getElementById('addChallengeBtn');
        if (addChallengeBtn) {
            addChallengeBtn.addEventListener('click', () => {
                this.addChallenge();
            });
        }
    }

    handleImageUpload(event, previewId) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            ToastManager.error('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                preview.classList.add('has-image');
            }
        };
        reader.readAsDataURL(file);
    }

    handleGalleryUpload(event) {
        const files = event.target.files;
        const container = document.getElementById('galleryImages');
        
        if (!container || files.length === 0) return;

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                ToastManager.error('Please select only image files');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="${e.target.result}" alt="Gallery image">
                    <button type="button" class="remove-gallery" onclick="this.parentElement.remove()">×</button>
                `;
                container.appendChild(galleryItem);
            };
            reader.readAsDataURL(file);
        });

        // Clear input to allow uploading same files again
        event.target.value = '';
    }

    // Project Actions
    editProject(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            this.openProjectModal(project);
        }
    }

    confirmDeleteProject(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        if (confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
            this.deleteProject(projectId);
        }
    }
}

// Global Functions for HTML onclick handlers
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize Admin App
let adminApp;
document.addEventListener('DOMContentLoaded', function() {
    adminApp = new AdminApp();
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Admin App Error:', e.message);
    if (adminApp) {
        ToastManager.error('An unexpected error occurred');
    }
});

// Console welcome message
console.log('%c🛠️ Project Admin System Loaded', 'color: #fad6e5; font-size: 16px; font-weight: bold;');
console.log('%cPortfolio Management System - Ready for use', 'color: #f8b5d0; font-size: 12px;');
