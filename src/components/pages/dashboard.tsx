"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function Dashboard() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await fetch('/api/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    }
  });

  const filteredRequests = statusFilter === "all"
    ? requests
    : requests?.filter(request => request.status === statusFilter);

  if (isLoading) {
    return <div className="container mx-auto py-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Solicitações</h1>
          <p className="text-muted-foreground">
            Acompanhe o status das suas solicitações
          </p>
        </div>
        <Button onClick={() => router.push("/request")}>Nova solicitação</Button>
      </div>

      <div className="mb-6">
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em análise</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredRequests?.map((request) => (
          <div
            key={request._id}
            className="rounded-lg border p-4 hover:bg-accent"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-row">
                <div className="mr-2">
                  <img
                    src={`https://image.tmdb.org/t/p/w200${request.mediaPoster}`}
                    alt={request.mediaTitle}
                    className="w-12 rounded-md"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {request.type === 'add' && 'Adicionar: '}
                    {request.type === 'update' && 'Atualizar: '}
                    {request.type === 'fix' && 'Corrigir: '}
                    {request.mediaTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Solicitado em {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {request.status === "pending" && "Pendente"}
                  {request.status === "in_progress" && "Em análise"}
                  {request.status === "completed" && "Concluído"}
                  {request.status === "rejected" && "Rejeitado"}
                </span>
                <Button variant="outline" size="sm" onClick={() => router.push(`/request/${request._id}`)}>
                  Ver detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}

        {(!filteredRequests || filteredRequests.length === 0) && (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma solicitação encontrada
          </div>
        )}
      </div>
    </div>
  );
}