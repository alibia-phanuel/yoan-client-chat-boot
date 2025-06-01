import axios from "axios";
import { FaqsList } from "../../type/type"; // Assure-toi que le chemin est correct
export const getGetQuestion = async (): Promise<FaqsList> => {
  const baseURL = "http://localhost:3000";
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
