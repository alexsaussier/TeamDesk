import { Consultant, Project, ConsultantLevel, ProjectStatus, TeamSize, ConsultantAssignment } from "../types";
import { mockSapApi } from './mockSapApi';

/**
 * SAP Professional Services Integration
 * 
 * This file provides integration with SAP's Professional Services APIs to sync project and resource data.
 * It handles the mapping between SAP's data model and our application's data model.
 * 
 * Key features:
 * - Fetches resources (consultants) and projects from SAP
 * - Maps SAP's resource data to our Consultant type
 * - Maps SAP's project data to our Project type
 * - Supports test mode using mock data
 * - Handles authentication and API endpoints for S/4HANA Cloud
 */



interface SAPIntegrationConfig {
    baseUrl: string;  // Should be specific to Project Management Professional APIs
    apiKey: string;
}

// Using the correct API endpoints from S/4HANA Cloud for Projects Resource Management
const SAP_ENDPOINTS = {
  // Project Management
  PROJECTS: '/s4hanacloud/sap/opu/odata/sap/API_ENTERPRISE_PROJECT/Projects?$inlinecount=allpages&$top=50',
  
  //reads the project team members of one particular project
  PROJECT_PROFILES: "/s4hanacloud/sap/opu/odata/sap/API_ENTERPRISE_PROJECT/A_EnterpriseProject(guid'{ProjectUUID'})/to_EntProjTeamMember", 
  
  // Resource Management
  RESOURCES: '/s4hanacloud/sap/opu/odata/sap/API_PROJECTDEMAND/A_ProjDmndResourceAssignment?$inlinecount=allpages&$top=50',
  RESOURCE_DEMANDS: '/s4hanacloud/sap/opu/odata/sap/API_PROJECTDEMAND/ResourceDemands',
  ASSIGNMENTS: '/s4hanacloud/sap/opu/odata/sap/API_PROJECTDEMAND/ResourceAssignments'
};

export class SAPProfessionalServicesIntegrator {
  private config: SAPIntegrationConfig;
  private isTestMode: boolean;
  
  constructor(config: SAPIntegrationConfig, isTestMode = false) {
    this.config = config;
    this.isTestMode = isTestMode;
  }

  async fetchResources(): Promise<Consultant[]> {
    // SAP API endpoint: /sap/c4c/api/v1/resources
    // Use mock API in test mode
    const response = this.isTestMode 
      ? await mockSapApi.getResources()
      : await this.makeRequest(SAP_ENDPOINTS.RESOURCES);
      
    return this.mapResourcesToConsultants(response);
  }

  async fetchProjects(): Promise<Project[]> {
    // SAP API endpoint: /sap/c4c/api/v1/projects
    // Use mock API in test mode
    const response = this.isTestMode 
      ? await mockSapApi.getProjects()
      : await this.makeRequest(SAP_ENDPOINTS.PROJECTS);
      
    return this.mapProjectsToProjects(response);
  }

  private mapResourcesToConsultants(sapResources: any[]): Consultant[] {
    return sapResources.map(resource => ({
      _id: resource.id,
      id: resource.id,
      organizationId: '',  // Set during import
      name: resource.fullName,
      level: this.mapSAPLevelToConsultantLevel(resource.jobGrade),
      salary: resource.annualCost,
      skills: resource.qualifications?.map((q: any) => q.name) || [],
      assignments: this.mapSAPAssignmentsToAssignments(resource.assignments),
      picture: '',  // Default empty
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: ''  // Set during import
    }));
  }

  private mapProjectsToProjects(sapProjects: any[]): Project[] {
    return sapProjects.map(project => ({
      id: project.id,
      organizationId: '',  // Set during import
      name: project.projectName,
      client: project.customerName,
      requiredSkills: [],  // Default empty
      startDate: project.startDate,
      endDate: project.endDate,
      status: this.mapSAPStatusToProjectStatus(project.projectStatus),
      teamSize: this.mapSAPStaffingToTeamSize(project.staffingPlan),
      chanceToClose: 100,  // Default value
      assignedConsultants: [],  // Default empty
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: ''  // Set during import
    }));
  }

  private async makeRequest(endpoint: string) {
    try {
      console.log('Making request to:', `${this.config.baseUrl}${endpoint}`);
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        headers: {
          'apikey': this.config.apiKey,
          'DataServiceVersion': '2.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('SAP API Error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`SAP API error: ${response.status} - ${errorText || response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  private mapSAPLevelToConsultantLevel(sapLevel: string): ConsultantLevel {
    const levelMap: Record<string, ConsultantLevel> = {
      'P1': 'junior',
      'P2': 'junior',
      'P3': 'manager',
      'P4': 'manager',
      'P5': 'partner'
    };
    return levelMap[sapLevel] || 'junior';
  }

  private mapSAPAssignmentsToAssignments(assignments: any[]): ConsultantAssignment[] {
    return assignments?.map(assignment => ({
      projectId: assignment.projectId,
      percentage: assignment.allocation
    })) || [];
  }

  private mapSAPStatusToProjectStatus(status: string): ProjectStatus {
    const statusMap: Record<string, ProjectStatus> = {
      'E0001': 'Discussions',
      'E0002': 'Sold',
      'E0003': 'Started',
      'E0004': 'Completed'
    };
    return statusMap[status] || 'Discussions';
  }

  private mapSAPStaffingToTeamSize(staffingPlan: any): TeamSize {
    return {
      junior: staffingPlan.junior || 0,
      manager: staffingPlan.manager || 0,
      partner: staffingPlan.partner || 0
    };
  }
}
