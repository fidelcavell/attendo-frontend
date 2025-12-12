import api from "@/api/api-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Profile } from "@/types/dataTypes";
import { formatDate } from "@/helper/Formatter";
import { useCallback, useEffect, useState } from "react";

interface DetailProfileProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProfile: Profile;
}

export default function DetailProfile({
  isOpen,
  setIsOpen,
  selectedProfile,
}: DetailProfileProps) {
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<
    string | undefined
  >(undefined);

  const getProfilePicture = useCallback(async () => {
    try {
      if (!selectedProfile) return;
      let objectUrl: string;

      console.log("Fetch image");

      api
        .get(`/profile/${selectedProfile.id}/profile-picture`, {
          responseType: "blob",
        })
        .then((res) => {
          objectUrl = URL.createObjectURL(res.data);
          setSelectedProfilePicture(objectUrl);
        });

      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    } catch (exception) {
      console.error(exception);
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (selectedProfile) {
      getProfilePicture();
    }
  }, [selectedProfile, getProfilePicture]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-center">
            Detail Profile
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="my-4 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <img
                  className="w-20 h-20 rounded-full object-cover border shadow-sm"
                  src={selectedProfilePicture}
                  alt="Profile"
                />
                <div className="ml-2">
                  <h3 className="text-base font-medium text-gray-900">
                    {selectedProfile.username}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedProfile.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedProfile.email}
                  </p>
                </div>
              </div>

              {/* Profile Info Grid */}
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-gray-500">Nama</div>
                <div className="font-medium text-gray-800">
                  {selectedProfile.name}
                </div>

                <div className="text-gray-500">Posisi</div>
                <div className="font-medium text-gray-800">
                  {selectedProfile.roleName.replace("ROLE_", "")}
                </div>

                <div className="text-gray-500">Tanggal Lahir</div>
                <div className="font-medium text-gray-800">
                  {formatDate(selectedProfile.birthDate ?? "")}
                </div>

                <div className="text-gray-500">Jenis Kelamin</div>
                <div className="font-medium text-gray-800">
                  {selectedProfile.gender}
                </div>

                <div className="text-gray-500">Alamat</div>
                <div className="font-medium text-gray-800">
                  {selectedProfile.address}
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
