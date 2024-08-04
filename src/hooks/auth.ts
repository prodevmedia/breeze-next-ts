import useSWR from "swr";
import axios from "@/lib/axios";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

declare type AuthMiddleware = "auth" | "guest";

type IUseAuth = {
  middleware?: AuthMiddleware;
  redirectIfAuthenticated?: string;
};

interface IApiRequest {
  setErrors?: React.Dispatch<React.SetStateAction<any | null>>;
  setStatus?: React.Dispatch<React.SetStateAction<any | null>>;
  [key: string]: any;
}

export interface User {
  id?: number;
  name?: string;
  email?: string;
  email_verified_at?: string;
  must_verify_email?: boolean; // this is custom attribute
  created_at?: string;
  updated_at?: string;
}

export const useAuth = ({ middleware, redirectIfAuthenticated }: IUseAuth) => {
  const router = useRouter();
  const params = useParams();

  const {
    data: user,
    error,
    mutate,
  } = useSWR("/api/user", () =>
    axios
      .get("/api/user")
      .then((res) => res.data)
      .catch((error) => {
        if (error.response.status !== 409) throw error;

        router.push("/verify-email");
      })
  );

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const register = async ({ setErrors, ...props }: IApiRequest) => {
    await csrf();

    if (setErrors) setErrors([]);

    axios
      .post("/register", props)
      .then(() => mutate())
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors && setErrors(error.response.data.errors);
      });
  };

  const login = async ({ setErrors, setStatus, ...props }: IApiRequest) => {
    await csrf();

    if (setErrors) setErrors([]);
    if (setStatus) setStatus(null);

    axios
      .post("/login", props)
      .then(() => mutate())
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors && setErrors(error.response.data.errors);
      });
  };

  const forgotPassword = async ({
    setErrors,
    setStatus,
    email,
  }: IApiRequest) => {
    await csrf();

    if (setErrors) setErrors([]);
    if (setStatus) setStatus(null);

    axios
      .post("/forgot-password", { email })
      .then((response) => setStatus && setStatus(response.data.status))
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors && setErrors(error.response.data.errors);
      });
  };

  const resetPassword = async ({
    setErrors,
    setStatus,
    ...props
  }: IApiRequest) => {
    await csrf();

    if (setErrors) setErrors([]);
    if (setStatus) setStatus(null);

    axios
      .post("/reset-password", { token: params.token, ...props })
      .then((response) =>
        router.push("/login?reset=" + btoa(response.data.status))
      )
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors && setErrors(error.response.data.errors);
      });
  };

  const resendEmailVerification = ({ setStatus }: IApiRequest) => {
    axios
      .post("/email/verification-notification")
      .then((response) => setStatus && setStatus(response.data.status));
  };

  const logout = async () => {
    if (!error) {
      await axios.post("/logout").then(() => mutate());
    }

    window.location.pathname = "/login";
  };

  useEffect(() => {
    if (middleware === "guest" && redirectIfAuthenticated && user)
      router.push(redirectIfAuthenticated);
    if (window.location.pathname === "/verify-email" && user?.email_verified_at)
      router.push(redirectIfAuthenticated || "/");
    if (middleware === "auth" && error) logout();
  }, [user, error]);

  return {
    user,
    register,
    login,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    logout,
  };
};
