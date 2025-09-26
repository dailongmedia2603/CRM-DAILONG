import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectDetailsDialog } from "@/components/projects/ProjectDetailsDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Placeholder for AcceptanceDialog to ensure the file compiles
const AcceptanceDialog = ({ open, onOpenChange, onConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void }) => {
    if (!open) return null;
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Completion?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to mark this project for acceptance?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const ProjectsIndexPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [projectForDetails, setProjectForDetails] = useState<Project | null>(null);
    const [isAcceptanceOpen, setIsAcceptanceOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const fetchProjects = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (data) {
            setProjects(data as Project[]);
        }
        if (error) {
            console.error("Error fetching projects", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleConfirmCompletion = () => {
        console.log("Completion confirmed");
        setIsAcceptanceOpen(false);
    };
    
    const openDetailsDialog = (project: Project) => {
        setProjectForDetails(project);
        setIsDetailsOpen(true);
    };

    return (
        <MainLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>All Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                                ) : (
                                    projects.map(project => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">{project.name}</TableCell>
                                            <TableCell>{project.client_name}</TableCell>
                                            <TableCell>{project.status}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => openDetailsDialog(project)}>
                                                    Details
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
            
            <AcceptanceDialog open={isAcceptanceOpen} onOpenChange={setIsAcceptanceOpen} onConfirm={handleConfirmCompletion} />
            <ProjectDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} project={projectForDetails} onUpdate={fetchProjects} />
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainLayout>
    );
};

export default ProjectsIndexPage;