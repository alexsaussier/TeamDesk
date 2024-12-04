import defaultAvatar from '@/public/images/default-avatar.avif'
import { Consultant, Project } from '@/types'

export const mockConsultants: Consultant[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      picture: defaultAvatar.src,
      skills: ['Strategy', 'Finance'],
      assignments: null,
      
    },
    {
      id: '2',
      name: 'Bob Smith',
      picture: defaultAvatar.src,
      skills: ['Technology', 'Operations'],
      assignments: null,
      
    },
    {
      id: '3',
      name: 'Charlie Brown',
      picture: defaultAvatar.src,
      skills: ['Marketing', 'Digital'],
      assignments: null,
    },
  ]


  export const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Strategic Review',
      requiredSkills: ['Strategy', 'Finance'],
      startDate: '2023-06-15',
      endDate: '2023-07-31',
      assignedConsultants: [mockConsultants[0]],
      status: 'Started',
    },
    {
      id: '2',
      name: 'Tech Transformation',
      requiredSkills: ['Technology', 'Operations'],
      startDate: '2023-07-15',
      endDate: '2023-09-15',
      assignedConsultants: [mockConsultants[0], mockConsultants[1]],
      status: 'Sold',
    },
    {
      id: '3',
      name: 'Financial Analysis',
      requiredSkills: ['Finance', 'Strategy'],
      startDate: '2023-08-15',
      endDate: '2023-09-30',
      assignedConsultants: [mockConsultants[0]],
      status: 'Discussions',
    },
    {
      id: '4',
      name: 'Digital Marketing Campaign',
      requiredSkills: ['Marketing', 'Digital'],
      startDate: '2023-06-01',
      endDate: '2023-06-30',
      assignedConsultants: [mockConsultants[0]],
      status: 'Completed',
    },
    {
      id: '5',
      name: 'Product Launch',
      requiredSkills: ['Marketing', 'Product Management'],
      startDate: '2023-10-01',
      endDate: '2023-12-15',
      assignedConsultants: [mockConsultants[0], mockConsultants[1], mockConsultants[2]],
      status: 'Discussions',
    },
  ]