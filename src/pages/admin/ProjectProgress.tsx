
import React from 'react';
import { AdminDashboardLayout } from '../../components/admin/AdminDashboardLayout';
import { ProjectProgress as ProjectProgressComponent } from '../../components/admin/ProjectProgress';

const ProjectProgress = () => {
  return (
    <AdminDashboardLayout>
      <ProjectProgressComponent />
    </AdminDashboardLayout>
  );
};

export default ProjectProgress;
