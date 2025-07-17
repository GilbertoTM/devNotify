import { useState, useEffect } fromreact;
import { DockerIntegration, DockerEvent, DockerContainer, DockerImage } from '../types';

export const useDocker = () => {
  const [integrations, setIntegrations] = useState<DockerIntegration);
  const events, setEvents] = useState<DockerEvent;
  const [containers, setContainers] = useState<DockerContainer);
  const images, setImages] = useState<DockerImage>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simular datos de Docker para demostración
  const mockContainers: DockerContainer=[object Object]    id: 'container-1,
      name: 'web-app',
      image: 'nginx:latest,  status: 'running,
      ports: ['80:80',443:443],
      created: 20241T10:30:00,
      size:15.2 MB'
    },[object Object]    id: 'container-2   name:database',
      image: 'postgres:13,  status: 'running,      ports: ['54322],
      created: 20241T10:35:00,
      size:45.8 MB'
    }
  ];

  const mockImages: DockerImage=
    [object Object]
      id: 'image-1',
      repository: nginx',
      tag: 'latest',
      size: '133 MB',
      created: 2024-1-10800    },
    [object Object]
      id: 'image-2',
      repository:postgres',
      tag:13,
      size: '314 MB',
      created: 2024-1-10T8:0   }
  ];

  const mockEvents: DockerEvent=
    [object Object]
      id: 'event-1  type: container,    action: 'start,
      timestamp: 20241T10:30:00Z',
      details: {
        containerId: 'container-1',
        containerName: web-app,
        status: 'running'
      },
      projectId: 'proj-1,
      severity:info'
    },
    [object Object]
      id: 'event-2      type: 'image,     action: 'pull,
      timestamp: 20241T10:25:00Z',
      details: [object Object]        imageId: image-1
        imageName: 'nginx:latest,        size: 133MB'
      },
      projectId: 'proj-1,
      severity: 'info'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setIsLoading(true);
    setTimeout(() => [object Object]     setContainers(mockContainers);
      setImages(mockImages);
      setEvents(mockEvents);
      setIsLoading(false);
    }, 10  },nst addIntegration = (integration: Omit<DockerIntegration, 'id>)=> {
    const newIntegration: DockerIntegration = {
      ...integration,
      id: `docker-${Date.now()}`
    };
    setIntegrations(prev => [...prev, newIntegration]);
  };

  const removeIntegration = (id: string) => {
    setIntegrations(prev => prev.filter(integration => integration.id !== id));
  };

  const testConnection = async (integration: DockerIntegration): Promise<boolean> => {
    // Simular prueba de conexión
    await new Promise(resolve => setTimeout(resolve, 1000);
    return Math.random() > 0.370de éxito para demo
  };

  const getContainerStats = () => {
    return {
      total: containers.length,
      running: containers.filter(c => c.status ===running').length,
      stopped: containers.filter(c => c.status ===stopped').length,
      images: images.length
    };
  };

  const getRecentEvents = (limit: number = 10
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0t);
  };

  return [object Object]    integrations,
    containers,
    images,
    events,
    isLoading,
    addIntegration,
    removeIntegration,
    testConnection,
    getContainerStats,
    getRecentEvents
  };
}; 