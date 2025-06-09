import axios, { AxiosError } from "axios";
export const deleteProduct = async (id: number) => {
  const baseURL = "https://chat-boot-92e040193633.herokuapp.com/api";
  try {
    const response = await axios.delete(`${baseURL}/newproducts/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.msg || "Erreur lors de la suppression"
      );
    }
    throw new Error("Une erreur inconnue est survenue");
  }
};
