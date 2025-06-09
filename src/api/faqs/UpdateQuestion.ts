import axios, { AxiosError } from "axios";

export interface FaqsData {
  question: string;
  answer: string;
}

export const UpdateFaqsDatas = async (id: string, data: FaqsData) => {
  const baseURL = "https://chat-boot-92e040193633.herokuapp.com";

  // Vérification des données
  if (!id) throw new Error("ID de la FAQ manquant.");
  if (!data || !data.question || !data.answer) {
    throw new Error("Données invalides pour la mise à jour.");
  }

  try {
    console.log(`PATCH vers : ${baseURL}/question/${id}`, data);
    const response = await axios.patch(`${baseURL}/question/${id}`, data, {
      withCredentials: true, // Optionnel selon ton backend
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Erreur Axios :", error);

    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.msg || "Erreur lors de la mise à jour"
      );
    }
    throw new Error("Une erreur inconnue est survenue");
  }
};
