import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectDetailsDialog } from "@/components/projects/ProjectDetailsDialog";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WeeklyReportPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [dialogs, setDialogs] = useState({ details: false });

    const fetchData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (data) {
            setProjects(data as Project[]);
        }
        if (error) {
            console.error("Error fetching data", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openDetailsDialog = (project: Project) => {
        setActiveProject(project);
        setDialogs({ details: true });
    };

    const closeDetailsDialog = () => {
        setActiveProject(null);
        setDialogs({ details: false });
    };

    return (
        <MainLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Report Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                                ) : (
                                    projects.map(project => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">{project.name}</TableCell>
                                            <TableCell>Not Submitted</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => openDetailsDialog(project)}>
                                                    View Project
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            {activeProject && (
                <>
                    <ProjectDetailsDialog
                        open={dialogs.details}
                        onOpenChange={closeDetailsDialog}
                        project={activeProject}
                        onUpdate={fetchData}
                    />
                </>
            )}
        </MainLayout>
    );
};

export default WeeklyReportPage;