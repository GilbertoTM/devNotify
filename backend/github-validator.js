// backend/github-validator.js
const https = require('https');

const makeGitHubRequest = (path, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'DevNotify-Backend',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(parsedData.message || `HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const validateGitHubCredentials = async (credentials) => {
  try {
    const { token } = credentials;
    
    if (!token) {
      return {
        valid: false,
        error: 'Token is required'
      };
    }

    // Verificar que el token sea válido obteniendo información del usuario
    const user = await makeGitHubRequest('/user', token);
    
    return {
      valid: true,
      user: {
        login: user.login,
        id: user.id,
        name: user.name,
        email: user.email,
        public_repos: user.public_repos,
        private_repos: user.total_private_repos
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

const validateGitHubRepository = async (credentials) => {
  try {
    const { token, username, repository } = credentials;
    
    if (!username || !repository) {
      return {
        valid: false,
        error: 'Username and repository are required'
      };
    }

    // Verificar que el repositorio existe y es accesible
    const repo = await makeGitHubRequest(`/repos/${username}/${repository}`, token);
    
    return {
      valid: true,
      repository: {
        id: repo.id,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        default_branch: repo.default_branch,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

const getRepositoryCommits = async (credentials, limit = 10) => {
  try {
    const { token, username, repository, branch = 'main' } = credentials;
    
    const commits = await makeGitHubRequest(
      `/repos/${username}/${repository}/commits?sha=${branch}&per_page=${limit}`,
      token
    );
    
    return {
      success: true,
      commits: commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        committer: commit.author ? {
          login: commit.author.login,
          avatar_url: commit.author.avatar_url
        } : null,
        html_url: commit.html_url
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const getRepositoryIssues = async (credentials, limit = 10) => {
  try {
    const { token, username, repository } = credentials;
    
    const issues = await makeGitHubRequest(
      `/repos/${username}/${repository}/issues?state=open&per_page=${limit}`,
      token
    );
    
    return {
      success: true,
      issues: issues.map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        user: {
          login: issue.user.login,
          avatar_url: issue.user.avatar_url
        },
        labels: issue.labels.map(label => ({
          name: label.name,
          color: label.color
        })),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        html_url: issue.html_url
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  validateGitHubCredentials,
  validateGitHubRepository,
  getRepositoryCommits,
  getRepositoryIssues
};
