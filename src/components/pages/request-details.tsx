"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Film, Tv } from "lucide-react";

const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500" },
  in_progress: { label: "Em análise", color: "bg-blue-500" },
  completed: { label: "Concluído", color: "bg-green-500" },
  rejected: { label: "Rejeitado", color: "bg-red-500" },
};

const typeMap = {
  add: "Adicionar",
  update: "Atualizar",
  fix: "Corrigir",
};

export function RequestDetails({ request, isOwner, isAdmin }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(request.status);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/admin/requests/${request._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setStatus(newStatus);
      toast({
        title: "Status atualizado",
        description: "A solicitação foi atualizada com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                {typeMap[request.type]}: {request.mediaTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                Solicitado em{" "}
                {format(new Date(request.createdAt), "PPP", { locale: ptBR })}
              </p>
            </div>
            <Badge
              className={`${
                statusMap[status].color
              } text-white capitalize px-2 py-1`}
            >
              {statusMap[status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            {request.mediaPoster ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${request.mediaPoster}`}
                alt={request.mediaTitle}
                className="w-32 rounded-md"
              />
            ) : (
              <div className="w-32 h-48 bg-muted rounded-md flex items-center justify-center">
                {request.mediaType === "movie" ? (
                  <Film className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Tv className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Detalhes</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tipo de mídia
                  </dt>
                  <dd className="text-sm">
                    {request.mediaType === "movie" ? "Filme" : "Série"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tipo de solicitação
                  </dt>
                  <dd className="text-sm">{typeMap[request.type]}</dd>
                </div>
                {request.description && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Descrição
                    </dt>
                    <dd className="text-sm whitespace-pre-wrap">
                      {request.description}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-4">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em análise</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Voltar
            </Button>
            {isOwner && (
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/requests/${request._id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    if (!response.ok) throw new Error("Failed to delete request");

                    toast({
                      title: "Solicitação removida",
                      description: "A solicitação foi removida com sucesso",
                    });
                    router.push("/dashboard");
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Erro ao remover solicitação",
                      description: "Tente novamente mais tarde",
                    });
                  }
                }}
              >
                Excluir solicitação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}