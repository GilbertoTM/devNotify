import { DockerIntegration, DockerEvent, DockerContainer, DockerImage } from '../types/docker';

class DockerClient {
  private host: string;
  private port: number;
  private config: any;

  constructor(integration: DockerIntegration) {
    this.host = integration.host;
    this.port = integration.port;
    this.config = integration.config;
  }

  private getBaseUrl(): string {
    const protocol = this.config.useTLS ? https' : http';
    return `${protocol}://$[object Object]this.host}:${this.port}`;
  }

  async testConnection(): Promise<boolean>[object Object] try {
      const response = await fetch(`${this.getBaseUrl()}/version`);
      return response.ok;
    } catch (error) {
      console.error(Docker connection test failed:', error);
      return false;
    }
  }

  async getContainers(): Promise<DockerContainer[]>[object Object] try {
      const response = await fetch(`${this.getBaseUrl()}/containers/json?all=true`);
      if (!response.ok) throw new Error('Failed to fetch containers');
      
      const containers = await response.json();
      return containers.map((container: any) => ({
        id: container.Id,
        name: container.Names?.[0 || container.Id,
        image: container.Image,
        status: container.State,
        ports: container.Ports?.map((p: any) => `${p.IP}:$[object Object]p.PublicPort}->$[object Object]p.PrivatePort}/${p.Type}`) || [],
        created: new Date(container.Created *1000OString(),
        size: container.SizeRw || 0  }));
    } catch (error) {
      console.error('Error fetching containers:', error);
      return [];
    }
  }

  async getImages(): Promise<DockerImage[]>[object Object] try {
      const response = await fetch(`${this.getBaseUrl()}/images/json`);
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const images = await response.json();
      return images.map((image: any) => ({
        id: image.Id,
        repository: image.RepoTags?.0?.split(:)[0] ||<none>',
        tag: image.RepoTags?.0?.split(:)[1] ||<none>',
        size: this.formatBytes(image.Size),
        created: new Date(image.Created *100oISOString()
      }));
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return0B';
    const k = 1024
    const sizes =B, KB', 'MB', GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  }

  // Simular eventos de Docker (en una implementación real, usarías WebSockets)
  async getEvents(): Promise<DockerEvent[]> [object Object]
    // Por ahora, simulamos eventos basados en el estado actual
    const containers = await this.getContainers();
    const images = await this.getImages();
    
    const events: DockerEvent[] = [];
    
    // Simular eventos de contenedores
    containers.forEach(container => {
      if (container.status === 'running') {
        events.push({
          id: `event-${Date.now()}-${container.id}`,
          type: 'container',
          action: start         timestamp: new Date().toISOString(),
          details: {
            containerId: container.id,
            containerName: container.name,
            status: container.status
          },
          projectId: 'default',
          severity: 'info'
        });
      }
    });

    // Simular eventos de imágenes
    images.forEach(image => {
      events.push({
        id: `event-${Date.now()}-${image.id}`,
        type: 'image,
        action: 'pull',
        timestamp: image.created,
        details:[object Object]
          imageId: image.id,
          imageName: `${image.repository}:${image.tag}`,
          size: image.size
        },
        projectId: default,
        severity:info'
      });
    });

    return events;
  }
}

export default DockerClient; 