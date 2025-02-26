"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music2, Search, Clock, CheckCircle2, 
  AlertCircle, Users, Settings, ChevronRight, 
  Share2, Copy, ArrowLeft, ArrowRight, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRequestsStore } from "@/stores/requests";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

export function AdminDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { requests, isLoading, fetchRequests, updateRequestStatus } = useRequestsStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const metrics = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === "pending").length || 0,
    in_progress: requests?.filter(r => r.status === "in_progress").length || 0,
    completed: requests?.filter(r => r.status === "completed").length || 0,
    rejected: requests?.filter(r => r.status === "rejected").length || 0
  };

  const filteredRequests = requests ? requests.filter(request => {
    const matchesSearch = request.mediaTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingStatus(requestId);
      await updateRequestStatus(requestId, newStatus);
      toast.success("Status atualizado ✨", {
        description: "A solicitação foi atualizada com sucesso!",
      });
    } catch (error) {
      toast.error("Erro ao atualizar status", {
        description: "Tente novamente mais tarde",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleShare = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShareDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "in_progress": return "bg-blue-500/20 text-blue-500";
      case "completed": return "bg-green-500/20 text-green-500";
      case "rejected": return "bg-red-500/20 text-red-500";
      default: return "";
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
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
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const MetricCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black md:h-screen md:fixed left-0 p-6">
          <div className="flex items-center gap-2 mb-8">
            <Music2 className="w-8 h-8 text-[--primary]" />
            <h1 className="text-xl font-bold">Painel de Solicitações</h1>
          </div>
          
          <nav className="space-y-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={() => router.push("/admin")}
            >
              <CheckCircle2 className="w-4 h-4" /> Solicitações
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
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 md:ml-64">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <MetricCard
                  title="Total de Solicitações"
                  value={metrics.total}
                  icon={Music2}
                  color="text-blue-500"
                />
                <MetricCard
                  title="Pendentes"
                  value={metrics.pending}
                  icon={Clock}
                  color="text-yellow-500"
                />
                <MetricCard
                  title="Concluídas"
                  value={metrics.completed}
                  icon={CheckCircle2}
                  color="text-green-500"
                />
                <MetricCard
                  title="Rejeitadas"
                  value={metrics.rejected}
                  icon={AlertCircle}
                  color="text-red-500"
                />
              </>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar solicitações..."
                  className="pl-10 bg-[#282828] border-none w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-[#282828] border-none">
                  <SelectValue placeholder="Status" />
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
          </div>

          {/* Requests Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg overflow-hidden border border-[#282828]"
          >
            <Table>
              <TableHeader className="bg-[#282828]">
                <TableRow>
                  <TableHead>Mídia</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-[68px] w-[45px] rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[140px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[120px]" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <AnimatePresence mode="popLayout">
                    {paginatedRequests.map((request) => (
                      <motion.tr
                        key={request._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-[#282828] transition-colors"
                      >
                        <TableCell>
                          {request.mediaPoster ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${request.mediaPoster}`}
                              alt={request.mediaTitle}
                              width={45}
                              height={68}
                              className="rounded-md"
                            />
                          ) : (
                            <div className="w-[45px] h-[68px] bg-[#282828] rounded-md flex items-center justify-center">
                              <Music2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{request.mediaTitle}</TableCell>
                        <TableCell>
                          {request.type === "add" && "Adicionar"}
                          {request.type === "update" && "Atualizar"}
                          {request.type === "fix" && "Corrigir"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status === "pending" && "Pendente"}
                              {request.status === "in_progress" && "Em análise"}
                              {request.status === "completed" && "Concluído"}
                              {request.status === "rejected" && "Rejeitado"}
                            </div>
                            <Select
                              value={request.status}
                              onValueChange={(value) => handleStatusChange(request._id, value)}
                              disabled={updatingStatus === request._id}
                            >
                              <SelectTrigger className="w-[140px] bg-[#282828] border-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="in_progress">Em análise</SelectItem>
                                <SelectItem value="completed">Concluído</SelectItem>
                                <SelectItem value="rejected">Rejeitado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => router.push(`/request/${request._id}`)}
                              className="hover:bg-[#3E3E3E]"
                            >
                              Ver detalhes
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShare(request._id)}
                              className="hover:bg-[#3E3E3E]"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <span className="text-sm text-gray-400">
                Página {currentPage} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="bg-[#3E3E3E] border-none"
              >
                Próxima
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Solicitação</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            <Input 
              readOnly 
              value={`${window.location.origin}/request/${selectedRequestId}`}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(`${window.location.origin}/request/${selectedRequestId}`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}