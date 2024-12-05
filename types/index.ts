export interface Consultant {
  _id: string
  id: string
  organizationId: string;
  name: string;
  skills: string[];
  assignments: Project[] | null;
  picture: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ProjectStatus = 'Discussions' | 'Sold' | 'Started' | 'Completed';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  client: string;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  assignedConsultants: Consultant[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export const getNextSoldProject = (projects: Project[]): Project | null => {
  const today = new Date();
  return projects
    .filter(project => 
      project.status === 'Sold' && 
      new Date(project.startDate) > today
    )
    .sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0] || null;
};
  
  