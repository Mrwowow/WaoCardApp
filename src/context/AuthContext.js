// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load stored authentication state
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('waocard_token');
        const storedUserData = await AsyncStorage.getItem('waocard_user_data');
        
        if (storedToken) {
          setUserToken(storedToken);
          if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
          }
        }
      } catch (e) {
        console.log('Failed to load authentication data', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Auth actions
  const authContext = {
    signIn: async (token, user) => {
      try {
        setIsLoading(true);
        await AsyncStorage.setItem('waocard_token', token);
        
        if (user) {
          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(user));
          setUserData(user);
        }
        
        setUserToken(token);
      } catch (e) {
        console.log('Sign in error', e);
      } finally {
        setIsLoading(false);
      }
    },
    
    signOut: async () => {
      try {
        setIsLoading(true);
        await AsyncStorage.removeItem('waocard_token');
        await AsyncStorage.removeItem('waocard_user_data');
        setUserToken(null);
        setUserData(null);
      } catch (e) {
        console.log('Sign out error', e);
      } finally {
        setIsLoading(false);
      }
    },
    
    fetchUserData: async (token, username) => {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Cookie", "_us=1744596404; ad-con=%7B%26quot%3Bdate%26quot%3B%3A%26quot%3B2025-04-13%26quot%3B%2C%26quot%3Bads%26quot%3B%3A%5B%5D%7D; PHPSESSID=1pjujq451m8ol33eelm0is4ck9; mode=day");
        
        const formdata = new FormData();
        formdata.append("server_key", "105b1bb6bb635934dc758a8831a201ac");
        formdata.append("fetch", "user_data");
        formdata.append("username", username);
        formdata.append("send_notify", "1");
        
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formdata,
          redirect: "follow"
        };
        
        const response = await fetch(`https://waocard.co/app/api/get-user-data-username?access_token=${token}`, requestOptions);
        const result = await response.json();
        
        if (result.api_status === 200 && result.user_data) {
          await AsyncStorage.setItem('waocard_user_data', JSON.stringify(result.user_data));
          setUserData(result.user_data);
          return result.user_data;
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    },
    
    // Expose state to consumers
    isLoading,
    userToken,
    userData
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook for easy context use
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;