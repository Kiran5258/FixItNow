import { useContext, useEffect } from "react";
import { userContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import { API_PATHS } from "../utils/apiPath";
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84

export const useUserAuth = () => {
  const { user, updateUser, clearUser } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) return;

    let isMounted = true;

    const fetchUserInfo = async () => {
      try {
<<<<<<< HEAD
        // const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
=======
        const response = await axiosInstance.get(API_PATHS.CUSTOMER.GET_USER_INFO);
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
        if (isMounted && response.data) {
          updateUser(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        if (isMounted) {
          clearUser();
          navigate("/login");
        }
      }
    };

    fetchUserInfo();

    return () => {
      isMounted = false;
    };
  }, [user, updateUser, clearUser, navigate]);
};
