import api from "@/api/api-config";
import type { OwnedStore, User } from "@/data/dataTypes";
import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";

interface ContextType {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  openSidebar: boolean;
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  currentStore: OwnedStore | null;
  setCurrentStore: React.Dispatch<React.SetStateAction<OwnedStore | null>>;
  ownedStoreData: OwnedStore[];
  setOwnedStoreData: React.Dispatch<React.SetStateAction<OwnedStore[]>>;
  getUserData: () => Promise<void>;
  getAllOwnedStore: (username: string) => Promise<void>;
}

const ContextApi = createContext<ContextType | undefined>(undefined);

export const ContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const storedToken = localStorage.getItem("JWT_TOKEN");
  const getToken = storedToken ? storedToken : null;
  const [token, setToken] = useState<string | null>(getToken);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [openSidebar, setOpenSidebar] = useState(true);
  const [currentStore, setCurrentStore] = useState<OwnedStore | null>(null);

  const [ownedStoreData, setOwnedStoreData] = useState<OwnedStore[]>([]);

  const getUserData = async () => {
    const storedUsername = localStorage.getItem("USERNAME");
    const username: string | null = storedUsername ? storedUsername : null;
    if (username) {
      try {
        const response = await api.get("/user/" + username);
        const user: User = {
          idUser: response.data.id,
          username: response.data.username,
          email: response.data.email,
          role: response.data.roleName,
          isActive: response.data.active,
          idProfile: response.data.idProfile,
          idSchedule: response.data.idSchedule,
          idAssociateStore: response.data.idStore,
        };
        setCurrentUser(user);

        if (
          response.data.roleName !== "ROLE_OWNER" &&
          response.data.idStore != null
        ) {
          const storeResponse = await api.get(
            `/store/${response.data.idStore}`
          );
          const currentStore: OwnedStore = {
            id: storeResponse.data.id,
            name: storeResponse.data.name,
            address: storeResponse.data.address,
            lat: storeResponse.data.lat,
            lng: storeResponse.data.lng,
            radius: storeResponse.data.radius,
            breakDuration: storeResponse.data.breakDuration,
            maxBreakCount: storeResponse.data.maxBreakCount,
            currentBreakCount: storeResponse.data.currentBreakCount,
            lateClockInPenaltyAmount:
              storeResponse.data.lateClockInPenaltyAmount,
            lateBreakOutPenaltyAmount:
              storeResponse.data.lateBreakOutPenaltyAmount,
            multiplierOvertime: storeResponse.data.multiplierOvertime,
            active: storeResponse.data.active,
          };
          setCurrentStore(currentStore);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getAllOwnedStore = async (username: string) => {
    try {
      const response = await api.get(`/store/owned/${username}`);
      const storeList = response.data as OwnedStore[];
      setOwnedStoreData(storeList);

      if (storeList.length > 0) {
        const updatedCurrentStore = currentStore
          ? storeList.find((s) => s.id === currentStore.id)
          : storeList[0];
        if (updatedCurrentStore) setCurrentStore(updatedCurrentStore);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      getUserData();
    }
  }, [token]);

  useEffect(() => {
    if (currentUser && currentUser.role == "ROLE_OWNER") {
      getAllOwnedStore(currentUser?.username);
    }
  }, [currentUser]);

  return (
    <ContextApi.Provider
      value={{
        token,
        setToken,
        currentUser,
        setCurrentUser,
        openSidebar,
        setOpenSidebar,
        currentStore,
        setCurrentStore,
        ownedStoreData,
        setOwnedStoreData,
        getUserData,
        getAllOwnedStore,
      }}
    >
      {children}
    </ContextApi.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLoginContext = () => {
  const context = useContext(ContextApi);
  if (!context) {
    throw new Error("useAuth must be used within a ContextProvider");
  }
  return context;
};
