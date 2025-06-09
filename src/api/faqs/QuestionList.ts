import axios from "axios";
import { FaqsList } from "../../type/type"; // Assure-toi que le chemin est correct
export const getGetQuestion = async (): Promise<FaqsList> => {
  const baseURL = "https://chat-boot-92e040193633.herokuapp.com";
  try {
    const response = await axios.get<FaqsList>(`${baseURL}/question`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    throw error;
  }
};
