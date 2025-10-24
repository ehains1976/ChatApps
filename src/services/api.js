// Service API pour VertProjet
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  // Méthode générique pour faire des requêtes
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Dashboard - Statistiques
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Projets
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Tâches
  async getTasks() {
    return this.request('/tasks');
  }

  async getTasksByProject(projectId) {
    const project = await this.getProject(projectId);
    return project.tasks || [];
  }
}

// Instance singleton
const apiService = new ApiService();
export default apiService;
