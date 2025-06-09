import axios, { AxiosError } from "axios";

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
}

export const updateUser = async (uuid: string, data: UpdateUserData) => {
  const baseURL = "https://chat-boot-92e040193633.herokuapp.com";
  try {
    const response = await axios.patch(`${baseURL}/users/${uuid}`, data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.msg || "Erreur lors de la mise à jour"
      );
    }
    throw new Error("Une erreur inconnue est survenue");
  }
};
