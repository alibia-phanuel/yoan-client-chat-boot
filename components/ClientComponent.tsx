// app/admin/chatbot/allPostProductId/ClientComponent.tsx
// Indique que ce composant est un composant client

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import React from "react";
interface Post {
  id: string; // Remplacez par `number` si les ID sont numériques
  created_time: string; // Assurez-vous que ce type correspond au format de vos données
}

interface ClientComponentProps {
  posts: Post[];
  numberPage: number;
}
const ClientComponent: React.FC<ClientComponentProps> = ({
  posts,
  numberPage,
}) => {
  console.log(posts);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">
        Posts Facebook {numberPage}
      </h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Date de création</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.id}</TableCell>
              <TableCell>
                {new Date(post.created_time).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientComponent;
