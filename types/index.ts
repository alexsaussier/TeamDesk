export type ConsultantLevel = 'junior' | 'manager' | 'partner';

export interface ConsultantAssignment {
  projectId: string;
  percentage: number;
}

export interface Consultant {
  _id: string
  id: string
  organizationId: string;
  name: string;
  level: ConsultantLevel;
  skills: string[];
  assignments: ConsultantAssignment[];
  picture: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ProjectStatus = 'Discussions' | 'Sold' | 'Started' | 'Completed';

export interface TeamSize {
  junior: number;
  manager: number;
  partner: number;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  client: string;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  teamSize: TeamSize;
  chanceToClose: number;
  assignedConsultants: {
    id: string;
    _id: string;
    name: string;
    skills: string[];
    picture: string;
    percentage: number;
    level: ConsultantLevel;
  }[];
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

export const getNextStartingProject = (projects: Project[]): Project | null => {
  const today = new Date();
  return projects
    .filter(project => 
      new Date(project.startDate) > today
    )
    .sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0] || null;
};
  
  