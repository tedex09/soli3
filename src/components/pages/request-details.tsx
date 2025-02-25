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
import { toast } from "sonner";
import { Film, Tv, Trash2 } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

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
  const [status, setStatus] = useState(request.status);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/admin/requests/${request._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setStatus(newStatus);
      toast.success("Status atualizado", {
        description: "A solicitação foi atualizada com sucesso",
      });
    } catch (error) {
      toast.error("Erro ao atualizar status", {
        description: "Tente novamente mais tarde",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/requests/${request._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete request");

      toast.success("Solicitação removida", {
        description: "A solicitação foi removida com sucesso",
      });
      
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao remover solicitação", {
        description: "Tente novamente mais tarde",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Excluindo..." : "Excluir solicitação"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}