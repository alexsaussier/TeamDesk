import { create } from 'zustand'
import { Project } from '@/types'

interface ProjectModalStore {
  isOpen: boolean
  selectedProject: Project | null
  openModal: (project?: Project | null) => void
  closeModal: () => void
}

export const useProjectModal = create<ProjectModalStore>((set) => ({
  isOpen: false,
  selectedProject: null,
  openModal: (project = null) => set({ isOpen: true, selectedProject: project }),
  closeModal: () => set({ isOpen: false, selectedProject: null }),
})) 