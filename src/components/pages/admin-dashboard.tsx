"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Music2, Search, Clock, CheckCircle2, 
  AlertCircle, Loader2, RefreshCcw, Users,
  Settings, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch requests with pagination
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['admin-requests', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/admin/requests?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    }
  });

  // Fetch metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }
  });

  const filteredRequests = requests?.items?.filter(request => {
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

  const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          {isLoadingMetrics ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

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
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={() => router.push("/admin")}
            >
              <CheckCircle2 className="w-4 h-4" /> Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={() => router.push("/admin/users")}
            >
              <Users className="w-4 h-4" /> Usuários
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="w-4 h-4" /> Configurações
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              title="Total de Solicitações"
              value={metrics?.total || 0}
              icon={Music2}
              color="text-blue-500"
            />
            <MetricCard
              title="Pendentes"
              value={metrics?.pending || 0}
              icon={Clock}
              color="text-yellow-500"
            />
            <MetricCard
              title="Concluídas"
              value={metrics?.completed || 0}
              icon={CheckCircle2}
              color="text-green-500"
            />
            <MetricCard
              title="Rejeitadas"
              value={metrics?.rejected || 0}
              icon={AlertCircle}
              color="text-red-500"
            />
          </div>

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
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg overflow-hidden border border-[#282828]"
            >
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/request/${request._id}`)}
                          className="hover:bg-[#3E3E3E]"
                        >
                          Ver detalhes
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 bg-[#282828]">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-[#3E3E3E] border-none"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-400">
                  Página {currentPage} de {Math.ceil((requests?.total || 0) / ITEMS_PER_PAGE)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!requests?.hasMore}
                  className="bg-[#3E3E3E] border-none"
                >
                  Próxima
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}