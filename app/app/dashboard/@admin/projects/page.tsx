"use client";

import ProjectTable from "@/components/dashboard/admin/project-table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Page() {
    const projects = useQuery(api.projects.getProjects, {});
    const getUsers = api.users.getUsers;
    const addProjectMember = api.projects.addProjectMember;
    const removeProjectMember = api.projects.removeProjectMember;

    return (
        <ProjectTable
            projects={projects}
            getUsers={getUsers}
            addProjectMember={addProjectMember}
            removeProjectMember={removeProjectMember}
        />
    );
}
