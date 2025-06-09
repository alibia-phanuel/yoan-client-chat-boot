import axios from "axios";

const API_BASE_URL = "https://chat-boot-92e040193633.herokuapp.com"; // Remplace par ton URL du backend

export const getProductById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);

    return response.data; // Assure-toi que le backend renvoie bien les données sous ce format
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
};
