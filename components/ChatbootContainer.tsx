// ChatbootContainer.tsx (version corrigée)
import { io } from "socket.io-client";
import LayoutSystem from "./share/LayoutSystem";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GrSend } from "react-icons/gr";
import axios from "axios";
import { motion } from "framer-motion";
import { FaImage } from "react-icons/fa6";
import { useEffect, useState } from "react";
import React from "react";
import { toast } from "react-toastify";
import avatar from "../public/assets/ppone.png";
import formatGabonNumberSmart from "../utils/formatGabonNumberSmart";
interface Contact {
  senderId: string;
  id: string;
  phoneNumber: string;
  message: string;
  time: string;
  unreadCount: number;
}

interface Message {
  id: number | string;
  sender: "user" | "bot";
  text: string;
  images?: string[];
  temp?: boolean;
  timestamp: string; // Nouvelle propriété
}

const ChatbootContainer: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // information de mon coter
  const [input, setInput] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages((prev) => [...prev, ...files]);
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(
          "https://chat-boot-92e040193633.herokuapp.com/messages"
        ); // adapte l’URL si besoin
        const data = response.data;
        console.log(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedContacts = data.map((item: any) => ({
          id: item.id.toString(),
          senderId: item.participantOneId, // ou autre champ selon ta DB
          phoneNumber: item.participantOneId, // si besoin
          message: item.Messages?.[0]?.content || "Aucun message",
          time: new Date(item.Messages?.[0]?.timestamp).toLocaleTimeString(),
          unreadCount: 0,
        }));

        setContacts(formattedContacts);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des messages :",
          error
        );
      }
    };

    fetchContacts();
  }, []);
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("new_message", (data) => {
      console.log("Nouveau message reçu :", data);

      // ➔ 1. Ajouter le nouveau message dans la discussion ouverte
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.id,
          sender: data.senderId === "+15551443267" ? "user" : "bot",
          text: data.content,
          timestamp: new Date().toISOString(), // Ajoutez ceci avec la valeur appropriée
          images: data.imagePath
            ? [`http://localhost:3000${data.imagePath}`]
            : undefined,
        },
      ]);

      // ➔ 2. Mettre à jour les contacts
      setContacts((prevContacts) => {
        const existingContactIndex = prevContacts.findIndex(
          (c) => c.senderId === data.senderId
        );

        if (existingContactIndex !== -1) {
          // Si le contact existe, on met juste à jour son dernier message
          const updatedContacts = [...prevContacts];
          updatedContacts[existingContactIndex] = {
            ...updatedContacts[existingContactIndex],
            message: data.content,
            time: new Date().toLocaleTimeString(), // tu peux aussi utiliser data.timestamp si tu le reçois
            unreadCount:
              selectedContact?.phoneNumber === data.senderId
                ? 0 // Si on est dans la conversation ouverte ➔ pas de "unread"
                : (updatedContacts[existingContactIndex].unreadCount || 0) + 1,
          };
          return updatedContacts;
        } else {
          // Sinon, c'est un tout nouveau contact
          return [
            {
              id: data.conversationId?.toString() || Date.now().toString(),
              senderId: data.senderId,
              phoneNumber: data.senderId,
              message: data.content,
              time: new Date().toLocaleTimeString(),
              unreadCount: 1,
            },
            ...prevContacts, // ➔ on ajoute au début
          ];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedContact]);

  const openChat = async (contact: Contact) => {
    // Mettre à jour l'état de manière immuable
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
    );
    setSelectedContact({ ...contact, unreadCount: 0 });
    console.log(selectedContact?.phoneNumber);
    // alert(selectedContact?.id);
    const currentUserId = "+15551443267";
    try {
      // Requête vers l'API pour récupérer les messages entre les deux participants
      if (selectedContact?.phoneNumber === undefined) {
        alert("clique encore");
      } else {
        const response = await axios.get(
          `https://chat-boot-92e040193633.herokuapp.com/${encodeURIComponent(
            selectedContact.phoneNumber
          )}/${encodeURIComponent(currentUserId)}`
        );
        const data = response.data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMessages = data.map((msg: any) => {
          const isUser = msg.senderId === currentUserId;

          return {
            id: msg.id,
            sender: isUser ? "user" : "bot",
            text: msg.content,
            timestamp: new Date(msg.timestamp).toISOString(), // Ajoutez ici aussi
            images: msg.imagePath
              ? [
                  isUser
                    ? msg.imagePath
                    : `https://chat-boot-92e040193633.herokuapp.com${msg.imagePath}`,
                ]
              : undefined,
          };
        });

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des messages :", error);
    }
  };
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    const recipientNumber = selectedContact?.phoneNumber;
    const recipientNumberFormat = formatGabonNumberSmart(recipientNumber);
    const cleanedNumber = recipientNumberFormat.startsWith("+")
      ? recipientNumberFormat.substring(1)
      : recipientNumberFormat;
    const conversationId = selectedContact?.id;
    const senderId = "+15551443267";
    const whatsappNumber = cleanedNumber;

    if (!whatsappNumber || !conversationId) {
      alert("Erreur: Le numéro ou la conversation est manquante");
      return;
    }

    // ✅ Empêche l’envoi seulement s’il n’y a ni texte ni image
    if (!trimmedInput && images.length === 0) {
      console.log("Aucun message à envoyer");
      return;
    }

    try {
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((image) => {
          formData.append("media", image);
        });

        if (trimmedInput) {
          formData.append("caption", trimmedInput);
        }
        if (!whatsappNumber || !conversationId) {
          alert("Erreur: Le numéro WhatsApp ou la conversation est manquante");
          return;
        }

        formData.append("senderId", senderId);
        formData.append("whatsappNumber", whatsappNumber);
        formData.append("conversationId", conversationId);

        const res = await axios.post(
          "https://chat-boot-92e040193633.herokuapp.com/send-media",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Média envoyé avec succès :", res.data);
        toast.success("Message envoyé avec succès");
      } else {
        // ✅ Ici on sait que trimmedInput est non vide
        const res = await axios.post(
          "https://chat-boot-92e040193633.herokuapp.com/send-text",
          {
            to: whatsappNumber,
            message: trimmedInput,
            conversationId,
            senderId,
            whatsappNumber,
          }
        );

        console.log("Texte envoyé avec succès ", res.data);
        toast.success("Message envoyé avec succès");
      }

      setInput("");
      setImages([]);
    } catch (error) {
      console.error("Erreur lors de l’envoi :", error);
    }
  };
  return (
    <LayoutSystem>
      <div className="h-[calc(100vh-70px)] flex justify-center">
        <div className="container my-4 flex gap-2 max-md:flex-wrap">
          <div className="w-[400px] border rounded-lg flex flex-col">
            <ScrollArea className="h-full p-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => openChat(contact)}
                  className={`flex items-start border-b p-3 cursor-pointer hover:bg-gray-50 relative ${
                    selectedContact?.id === contact.id ? "bg-gray-100" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={avatar} className="w-10 h-10" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <h5 className="text-gray-700 text-sm mb-1">
                      {contact.senderId}
                    </h5>
                    <p className="text-gray-500 text-sm truncate">
                      {contact.message}
                    </p>
                  </div>
                  <div
                    className="text-sm text-gray-500  absolute right-8
               "
                  >
                    {contact.time}
                  </div>
                  {contact.unreadCount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>

          {selectedContact?.phoneNumber && (
            <div className="flex-1 border rounded-md flex flex-col">
              <div className="p-4 border-b flex items-center">
                <Avatar>
                  <AvatarImage src={avatar} className="w-10 h-10" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h5>{selectedContact.senderId}</h5>
                  <p className="text-sm italic">En ligne</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg max-w-xs my-3 ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white self-end ml-auto"
                        : "bg-gray-200 text-gray-900 self-start"
                    }`}
                  >
                    <p>{msg.text || ""}</p>
                    {msg.images && msg.images.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`image-${index}`}
                            className="w-40 rounded border border-red-500"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </ScrollArea>
              <div>
                {images.length > 0 && (
                  <div className="p-3 flex gap-2 flex-wrap border-t">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`preview-${index}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 border-t flex items-center">
                  <label className="cursor-pointer">
                    <FaImage className="text-gray-500 text-xl mr-2" />
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez un message..."
                    className="flex-1 p-2 border rounded placeholder:text-gray-400"
                  />
                  <button
                    onClick={sendMessage}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-lg"
                  >
                    <GrSend />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutSystem>
  );
};

export default ChatbootContainer;
