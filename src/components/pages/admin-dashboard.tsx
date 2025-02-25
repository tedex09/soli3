"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Music2, Search, Clock, CheckCircle2, 
  AlertCircle, Loader2, RefreshCcw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const response = await fetch('/api/admin/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    }
  });

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = request.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast({
        title: "Status atualizado ✨",
        description: "A solicitação foi atualizada com sucesso!"
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black h-screen fixed left-0 p-6">
          <div className="flex items-center gap-2 mb-8">
            <Music2 className="w-8 h-8 text-[#1DB954]" />
            <h1 className="text-xl font-bold">Content Hub</h1>
          </div>
          
          <nav className="space-y-4">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <CheckCircle2 className="w-4 h-4" /> Aprovadas
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <AlertCircle className="w-4 h-4" /> Pendentes
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Clock className="w-4 h-4" /> Em análise
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar solicitações..."
                  className="pl-10 bg-[#282828] border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-[#282828] border-none">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em análise</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-[#282828] border-none">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="add">Adicionar</SelectItem>
                  <SelectItem value="update">Atualizar</SelectItem>
                  <SelectItem value="fix">Corrigir</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                className="bg-[#282828] border-none hover:bg-[#3E3E3E]"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Requests Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border border-[#282828]">
              <Table>
                <TableHeader className="bg-[#282828]">
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests?.map((request) => (
                    <TableRow key={request._id} className="hover:bg-[#282828] transition-colors">
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>
                        {request.type === "add" && "Adicionar"}
                        {request.type === "update" && "Atualizar"}
                        {request.type === "fix" && "Corrigir"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.status}
                          onValueChange={(value) => handleStatusChange(request._id, value)}
                        >
                          <SelectTrigger className="w-[140px] bg-[#282828] border-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em análise</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}