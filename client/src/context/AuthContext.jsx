import { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import apiClient from "../api/client";

const INITIAL_STATE = {
  user: null,
  isAuthenticating: true,
  error: null,
};

const AuthContext = createContext(INITIAL_STATE);

/**
 * Reducer for managing authentication state transitions.
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isAuthenticating: true, error: null };
    case "AUTH_SUCCESS":
      return { user: action.payload, isAuthenticating: false, error: null };
    case "AUTH_FAILURE":
      return { user: null, isAuthenticating: false, error: action.payload };
    case "AUTH_LOGOUT":
      return { user: null, isAuthenticating: false, error: null };
    default:
      return state;
  }
};

/**
 * Provider component for standardizing authentication logic across the app.
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  const verifyAuthentication = useCallback(async () => {
    dispatch({ type: "AUTH_START" });
    try {
      const { user } = await apiClient.get("/auth/me");
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (err) {
      dispatch({ type: "AUTH_FAILURE", payload: err.message });
    }
  }, []);

  useEffect(() => {
    verifyAuthentication();
  }, [verifyAuthentication]);

  const performLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Session termination failed:", err);
    } finally {
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  const syncUser = async () => {
    try {
      const { user } = await apiClient.get("/auth/me");
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (err) {
       console.error("User sync failed:", err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
        logout: performLogout,
        refreshUser: syncUser,
        revalidate: verifyAuthentication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume authentication context with safety checks.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be consumed within an AuthProvider");
  }
  return context;
};
