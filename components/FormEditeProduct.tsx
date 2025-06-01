import { useEffect, useState } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import Layout from "./pages/Layout";
import LayoutSystem from "../components/share/LayoutSystem";
type ElementType = "image" | "text";

interface BaseElement {
  id: string;
  type: ElementType;
  order: number;
}
type ImageElement = {
  id: string;
  type: "image";
  file?: File;
  url?: string;
  caption: string;
  order: number;
};
type ProductElement = ImageElement | TextElement;

interface TextElement extends BaseElement {
  type: "text";
  content: string;
}

type FormElement = ImageElement | TextElement;
const MAX_IMAGES = 10;
const MAX_TEXTS = 10;

const FormUpdateProduct = () => {
  const { id } = useParams(); // récupère l'id depuis l'URL
  const [user, setUser] = useState<string | null>(null);
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [elements, setElements] = useState<FormElement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("AdminName");
    setUser(storedUser);

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/newproducts/${id}`);
        const product = res.data;

        setProductId(product.id);
        setName(product.name);

        const formattedElements: FormElement[] = product.elements.map(
          (el: ProductElement, index: number) => {
            if (el.type === "image") {
              return {
                id: `img-${index}`,
                type: "image",
                caption: el.caption,
                order: el.order,
                file: null,
                url: el.url,
              };
            } else {
              return {
                id: `text-${index}`,
                type: "text",
                content: el.content,
                order: el.order,
              };
            }
          }
        );
        setElements(formattedElements);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du produit :", error);
        toast.error("Impossible de charger le produit.");
      }
    };

    fetchProduct();
  }, [id]);

  const getNextOrder = () => {
    if (elements.length === 0) return 1;
    return Math.max(...elements.map((el) => el.order)) + 1;
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newElements: ImageElement[] = Array.from(files)
      .slice(
        0,
        MAX_IMAGES - elements.filter((el) => el.type === "image").length
      )
      .map((file) => ({
        id: `img-${file.name}-${Date.now()}`,
        type: "image",
        file,
        caption: "",
        order: getNextOrder(),
      }));

    setElements((prev) => [...prev, ...newElements]);
  };

  const updateCaption = (id: string, value: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.type === "image" && el.id === id ? { ...el, caption: value } : el
      )
    );
  };

  const updateTextContent = (id: string, value: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.type === "text" && el.id === id ? { ...el, content: value } : el
      )
    );
  };

  const addTextBlock = () => {
    if (elements.filter((el) => el.type === "text").length < MAX_TEXTS) {
      const newText: TextElement = {
        id: `text-${Date.now()}`,
        type: "text",
        content: "",
        order: getNextOrder(),
      };
      setElements((prev) => [...prev, newText]);
    }
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orders = elements.map((el) => el.order);
    if (new Set(orders).size !== orders.length) {
      alert("Des éléments ont le même numéro d'ordre !");
      return;
    }

    if (!name || !productId) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const formData = new FormData();
    formData.append("id", productId);
    formData.append("name", name);
    formData.append("createdBy", user as string);

    const structuredElements = [];
    let imageIndex = 0;

    for (const el of elements) {
      if (el.type === "image") {
        if (el.file) {
          formData.append("images", el.file);
          structuredElements.push({
            type: "image",
            caption: el.caption,
            order: el.order,
            imageIndex: imageIndex++,
          });
        } else {
          structuredElements.push({
            type: "image",
            caption: el.caption,
            order: el.order,
            url: el.url,
          });
        }
      } else {
        structuredElements.push({
          type: "text",
          content: el.content,
          order: el.order,
        });
      }
    }

    formData.append("elements", JSON.stringify(structuredElements));

    try {
      await axios.put(`/api/newproducts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Produit mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      toast.error("Échec de la mise à jour du produit.");
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <Layout>
      <LayoutSystem>
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl mt-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Modifier le produit
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Champs identifiant et nom */}
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled
              className="block w-full py-2 px-4 rounded-md border border-gray-300 bg-gray-100"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du produit"
              className="block w-full py-2 px-4 rounded-md border border-gray-300"
              required
            />

            {/* Upload d'image */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={
                elements.filter((el) => el.type === "image").length >=
                MAX_IMAGES
              }
            />

            {/* Bouton ajout de texte */}
            <button
              type="button"
              onClick={addTextBlock}
              className="text-blue-600"
            >
              + Ajouter un bloc texte
            </button>

            {/* Aperçu des éléments */}
            {elements
              .sort((a, b) => a.order - b.order)
              .map((el) => (
                <div key={el.id} className="border p-3 rounded-lg relative">
                  <input
                    type="number"
                    value={el.order}
                    onChange={(e) => {
                      const newOrder = parseInt(e.target.value) || 1;
                      setElements((prev) =>
                        prev.map((item) =>
                          item.id === el.id
                            ? { ...item, order: newOrder }
                            : item
                        )
                      );
                    }}
                    className="w-16"
                  />
                  <button
                    onClick={() => removeElement(el.id)}
                    className="absolute top-2 right-2"
                  >
                    <FiTrash2 />
                  </button>

                  {el.type === "image" ? (
                    <>
                      {el.file ? (
                        <img
                          src={URL.createObjectURL(el.file)}
                          alt="preview"
                          className="w-full rounded"
                        />
                      ) : (
                        <img
                          src={el.url}
                          alt="old"
                          className="w-full rounded"
                        />
                      )}
                      <textarea
                        value={el.caption}
                        onChange={(e) => updateCaption(el.id, e.target.value)}
                        placeholder="Légende"
                      />
                    </>
                  ) : (
                    <textarea
                      value={el.content}
                      onChange={(e) => updateTextContent(el.id, e.target.value)}
                      placeholder="Contenu texte"
                    />
                  )}
                </div>
              ))}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded bg-green-600 text-white"
            >
              Mettre à jour
            </button>
          </form>
        </div>
      </LayoutSystem>
    </Layout>
  );
};

export default FormUpdateProduct;
