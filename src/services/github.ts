// Servicio para interactuar con la API de GitHub
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export class GitHubService {
  private baseURL = 'https://api.github.com';
  private backendURL = 'http://localhost:3001';
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevNotify-App'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async makeBackendRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.backendURL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Obtener información del usuario
  async getUser(): Promise<any> {
    return this.makeRequest('/user');
  }

  // Obtener repositorios del usuario
  async getUserRepositories(): Promise<GitHubRepository[]> {
    return this.makeRequest('/user/repos?sort=updated&per_page=30');
  }

  // Obtener repositorios públicos de un usuario
  async getUserPublicRepositories(username: string): Promise<GitHubRepository[]> {
    return this.makeRequest(`/users/${username}/repos?sort=updated&per_page=30`);
  }

  // Obtener información de un repositorio específico
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.makeRequest(`/repos/${owner}/${repo}`);
  }

  // Obtener commits recientes de un repositorio (via backend)
  async getRepositoryCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
    try {
      const response = await this.makeBackendRequest(`/api/github/${owner}/${repo}/commits`);
      return response.commits || [];
    } catch (error) {
      // Fallback to direct API call
      return this.makeRequest(`/repos/${owner}/${repo}/commits?per_page=10`);
    }
  }

  // Obtener issues abiertas de un repositorio (via backend)
  async getRepositoryIssues(owner: string, repo: string): Promise<any[]> {
    try {
      const response = await this.makeBackendRequest(`/api/github/${owner}/${repo}/issues`);
      return response.issues || [];
    } catch (error) {
      // Fallback to direct API call
      return this.makeRequest(`/repos/${owner}/${repo}/issues?state=open&per_page=10`);
    }
  }

  // Obtener pull requests de un repositorio
  async getRepositoryPullRequests(owner: string, repo: string): Promise<any[]> {
    return this.makeRequest(`/repos/${owner}/${repo}/pulls?state=open&per_page=10`);
  }

  // Validar que las credenciales sean correctas (via backend)
  async validateCredentials(): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
      if (!this.token) {
        return { valid: false, error: 'No token provided' };
      }

      // Obtener el usuario primero para el username
      const user = await this.getUser();
      
      // Validar con el backend
      const response = await this.makeBackendRequest('/api/validate-github-credentials', {
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          username: user.login
        })
      });

      if (response.success) {
        return { valid: true, user: response.user || user };
      } else {
        return { valid: false, error: response.error || 'Validation failed' };
      }
    } catch (error: any) {
      // Si falla obtener el usuario, el token es inválido
      return { 
        valid: false, 
        error: error.message || 'Invalid credentials' 
      };
    }
  }

  // Verificar que un repositorio existe y es accesible (via backend)
  async validateRepository(owner: string, repo: string): Promise<{ valid: boolean; repository?: GitHubRepository; error?: string }> {
    try {
      const response = await this.makeBackendRequest('/api/validate-github-repository', {
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          username: owner,
          repository: repo
        })
      });

      if (response.success) {
        return { valid: true, repository: response.repository };
      } else {
        return { valid: false, error: response.error || 'Repository validation failed' };
      }
    } catch (error: unknown) {
      // Fallback to direct API call
      try {
        const repository = await this.getRepository(owner, repo);
        return { valid: true, repository };
      } catch (fallbackError: unknown) {
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Repository not found or not accessible';
        return { 
          valid: false, 
          error: errorMessage
        };
      }
    }
  }
}

// Función helper para crear una instancia del servicio
export const createGitHubService = (token?: string) => {
  return new GitHubService(token);
};
