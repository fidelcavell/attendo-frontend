import {
  ChevronsUpDown,
  LogOut,
  MailCheck,
  RotateCcwKey,
  UserPen,
  UserRoundX,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLoginContext } from "@/hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import api from "@/api/api-config";
import ChangeEmailDialog from "../dialogs/ChangeEmailDialog";
import ChangePasswordDialog from "../dialogs/ChangePasswordDialog";
import DeleteAccountDialog from "../dialogs/DeleteAccountDialog";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { currentUser, setToken, setCurrentUser, setCurrentStore,setStoreLoaded } =
    useLoginContext();

  const navigate = useNavigate();
  const [lastAction, setLastAction] = useState<
    "email" | "password" | "logout" | "delete" | null
  >(null);

  const [profilePic, setProfilePic] = useState("");
  const [isChangeEmail, setIsChangeEmail] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isLogOut, setIsLogOut] = useState(false);
  const [isDeleteAccount, setIsDeleteAccount] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const onLogout = () => {
    localStorage.removeItem("CSRF_TOKEN");
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USERNAME");
    setToken(null);
    setCurrentUser(null);
    setCurrentStore(null);
    setStoreLoaded(false);

    setLastAction("logout");
    navigate("/sign-in", { replace: true });
  };

  useEffect(() => {
    if (!currentUser?.idProfile) return;

    let objectUrl: string;

    api
      .get(`/profile/${currentUser.idProfile}/profile-picture`, {
        responseType: "blob",
      })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setProfilePic(objectUrl);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [currentUser]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    className="object-center object-cover"
                    src={profilePic}
                    alt={currentUser?.username}
                  />
                  <AvatarFallback className="rounded-lg">PP</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentUser?.username}
                  </span>
                  <span className="truncate text-xs">{currentUser?.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setIsChangeEmail(true)}>
                  <MailCheck />
                  Change email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsChangePassword(true)}>
                  <RotateCcwKey />
                  Change password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/profile")}>
                  <UserPen />
                  Profile setting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteAccount(true)}>
                  <UserRoundX />
                  Delete account
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsLogOut(true)}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Change Password dialog */}
      <ChangePasswordDialog
        isOpen={isChangePassword}
        setIsOpen={setIsChangePassword}
        setResponse={setResponse}
        setResponseDialog={setIsDialogOpen}
        setLastAction={setLastAction}
      />

      {/* Change Email */}
      <ChangeEmailDialog
        isOpen={isChangeEmail}
        setIsOpen={setIsChangeEmail}
        setResponse={setResponse}
        setResponseDialog={setIsDialogOpen}
        setLastAction={setLastAction}
      />

      {/* Log Out alert dialog */}
      <AlertDialog open={isLogOut} onOpenChange={setIsLogOut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure to log out now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onLogout()}>
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account */}
      <DeleteAccountDialog
        isOpen={isDeleteAccount}
        setIsOpen={setIsDeleteAccount}
        setResponse={setResponse}
        setResponseDialog={setIsDialogOpen}
        setLastAction={setLastAction}
      />

      {/* Response dialog */}
      {response && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {response.success ? "Success" : "Error"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {response.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setIsDialogOpen(false);
                  if (response.success && lastAction != "email") {
                    onLogout();
                  }
                }}
              >
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
