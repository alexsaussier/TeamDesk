export const mockSapApi = {
  async getResources() {
    return [
      {
        id: "1",
        fullName: "John MockData",
        jobGrade: "P4", // SAP's job grade
        annualCost: 85000,
        qualifications: [
          { name: "JavaScript" },
          { name: "React" }
        ],
        assignments: [
          {
            projectId: "PRJ001",
            allocation: 100,
            startDate: "2024-01-01",
            endDate: "2024-06-30"
          }
        ]
      }
      // Add more mock data...
    ];
  },

  async getProjects() {
    return [
      {
        id: "PRJ001",
        projectName: "Digital Transformation",
        customerName: "ACME Corp",
        startDate: "2024-01-01",
        endDate: "2024-06-30",
        projectStatus: "E0002", // SAP's status code
        staffingPlan: {
          junior: 2,
          manager: 1,
          partner: 1
        }
      }
      // Add more mock data...
    ];
  }
};
