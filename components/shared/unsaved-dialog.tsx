import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

type LeavingDialogProps = {
    isOpen: boolean;
    yesCallback: () => void;
    noCallback: () => void;
};

export const UnsavedChangesDialog = ({ isOpen, yesCallback, noCallback }: LeavingDialogProps) => {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        The data will be lost.
                    </AlertDialogTitle>
                    <AlertDialogDescription>Are you sure you want to leave the page?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => noCallback()}>No</AlertDialogCancel>
                    <AlertDialogAction onClick={() => yesCallback()}>Yes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
