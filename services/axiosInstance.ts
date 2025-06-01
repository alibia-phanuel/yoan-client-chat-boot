import axios from "axios";

const API_URL = "https://chat-boot-92e040193633.herokuapp.com/"; // Remplace par ton URL d'API

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token dans les headers de chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Ajoute le token dans l'en-tête Authorization
    }

    return config;
  },
  (error) => {
    // Gestion des erreurs de requête
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer la réponse et les erreurs globales
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // Renvoie la réponse si tout est ok
  },
  (error) => {
    // Gère les erreurs de réponse (par exemple, 401 Unauthorized ou 500 Internal Server Error)
    if (error.response) {
      // Erreur côté serveur ou en raison de l'authentification
      if (error.response.status === 401) {
        console.error("Non autorisé. Token expiré ou invalide.");
        // Tu peux gérer la redirection vers la page de login ici si nécessaire
      } else if (error.response.status === 500) {
        console.error("Erreur serveur. Veuillez réessayer plus tard.");
      }
    } else {
      console.error("Erreur inconnue. Vérifiez votre connexion internet.");
    }

    return Promise.reject(error); // Renvoie l'erreur pour la gestion locale
  }
);

export default axiosInstance;
