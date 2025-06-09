import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

type Post = {
  id: string;
  created_time: string;
};

export default function FacebookPostsTables() {
  const [page1Posts, setPage1Posts] = useState<Post[]>([]);
  const [page2Posts, setPage2Posts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res1 = await axios.get(
          "https://graph.facebook.com/v21.0/389037834288932/posts?access_token=EAAQZBjOj8ZBnsBOZBKGVVCwFkmn0gKe0msJpZC3x12ziyGy5dV9rAaQlInuUZBCbIP6xhZCCZAODRdZA68COfpVDH0kVie67oBNHZCt7JdFXKwxNpTvdq49gMgISK2CdjyIgnPqy77H7fQWNkmpVZBuj6Bkr0NdaJLkkmLiMFDla2bIj96BEZCUhxj31w3n6BQVstMP"
        );

        const res2 = await axios.get(
          "https://graph.facebook.com/v22.0/101051433077608/posts?access_token=EAAQZBjOj8ZBnsBOwfRuDcIhE40VZB1wlp103GAQR8g9witj4pZBFxk6aRIFbZB01P6ZAelOnQL7EtHy5uwTKAGdaUTAj0nim23kl3E4ACZBZBF5m2SRiZBoOXnRyegDPzGsWfASIp8fZC4YVuSCaetMZAv2rHciaEepZBZCl7qu5oMRbXblc3YjHLZCpJ2Pkl9rjKqPdsZD"
        );

        setPage1Posts(res1.data.data);
        setPage2Posts(res2.data.data);
      } catch (err) {
        console.error("Erreur de récupération des données", err);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  const renderTable = (posts: Post[], title: string) => (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3 font-semibold text-gray-700">ID</th>
            <th className="text-left p-3 font-semibold text-gray-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="p-3 text-sm text-gray-800">{post.id}</td>
              <td className="p-3 text-sm text-gray-600">
                {formatDate(post.created_time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {renderTable(page1Posts, "📄 Page : Top Qualités 241")}
      {renderTable(page2Posts, "📄 Page : afrikagadget.shop")}
    </div>
  );
}
