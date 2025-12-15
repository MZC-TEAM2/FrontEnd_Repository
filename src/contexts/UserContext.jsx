import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import authService from '../services/authService';
import profileService from '../services/profileService';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profileData = await profileService.getMyProfile();
      setUser(profileData);

      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        currentUser.name = profileData.name;
        currentUser.thumbnailUrl = profileData.thumbnailUrl;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      const localUser = authService.getCurrentUser();
      setUser(localUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };

      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        Object.assign(currentUser, updatedData);
        localStorage.setItem('user', JSON.stringify(currentUser));
      }

      return newUser;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      updateUser,
      refreshUser,
      clearUser,
    }),
    [user, isLoading, updateUser, refreshUser, clearUser]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

export default UserContext;