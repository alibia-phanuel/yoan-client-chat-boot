import { useEffect, useState } from "react";
import axios from "axios";

interface Post {
  id: string;
  message: string;
  created_time: string;
}

import Layout from "../../components/pages/Layout";
import LayouSystem from "../share/LayoutSystem";

// Format de date en français
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return new Intl.DateTimeFormat("fr-FR", options).format(date);
};

const PostsFacebook = () => {
  const [topQualitesPosts, setTopQualitesPosts] = useState<Post[]>([]);
  const [afrikaGadgetPosts, setAfrikaGadgetPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [topQualitesRes, afrikagadgetRes] = await Promise.all([
          axios.get(
            "https://chat-boot-92e040193633.herokuapp.com/facebook/posts/topqualites"
          ),
          axios.get("https://chat-boot-92e040193633.herokuapp.com/facebook/posts/afrikagadget"),
        ]);

        setTopQualitesPosts(topQualitesRes.data.data);
        setAfrikaGadgetPosts(afrikagadgetRes.data.data);
      } catch (error) {
        console.error("Erreur lors du chargement des posts :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <LayouSystem>
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Publications Facebook
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne Top Qualités */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-blue-600 text-center">
                Top Qualités
              </h2>
              <div className="space-y-4">
                {topQualitesPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden"
                  >
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 text-left text-gray-700">
                        <tr>
                          <th className="px-4 py-2 border-b">Clé</th>
                          <th className="px-4 py-2 border-b">Valeur</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border-b text-gray-600">
                            ID Produit
                          </td>
                          <td className="px-4 py-2 border-b text-gray-800">
                            {post.id}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">Date</td>
                          <td className="px-4 py-2 text-gray-800">
                            Publié le {formatDate(post.created_time)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne Afrika Gadget */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-green-600 text-center">
                Afrika Gadget
              </h2>
              <div className="space-y-4">
                {afrikaGadgetPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden"
                  >
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 text-left text-gray-700">
                        <tr>
                          <th className="px-4 py-2 border-b">Clé</th>
                          <th className="px-4 py-2 border-b">Valeur</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border-b text-gray-600">
                            ID Produit
                          </td>
                          <td className="px-4 py-2 border-b text-gray-800">
                            {post.id}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-600">Date</td>
                          <td className="px-4 py-2 text-gray-800">
                            Publié le {formatDate(post.created_time)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {loading && (
            <div className="flex justify-center items-center  w-full ">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
            </div>
          )}
        </div>
      </LayouSystem>
    </Layout>
  );
};

export default PostsFacebook;
