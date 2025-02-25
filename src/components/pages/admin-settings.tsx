"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Music2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const settingsSchema = z.object({
  requestLimitPerDay: z.number().min(1),
  requestLimitPerWeek: z.number().min(1),
  whatsappEnabled: z.boolean(),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
});

export function AdminSettings() {
  const router = useRouter();
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      requestLimitPerDay: 10,
      requestLimitPerWeek: 50,
      whatsappEnabled: false,
      twilioAccountSid: "",
      twilioAuthToken: "",
      twilioPhoneNumber: "",
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    onSuccess: (data) => {
      form.reset(data);
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Configurações salvas", {
        description: "As alterações foram aplicadas com sucesso",
      });
    },
    onError: () => {
      toast.error("Erro ao salvar", {
        description: "Ocorreu um erro ao salvar as configurações",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    // Only include Twilio settings if WhatsApp is enabled
    const settingsToUpdate = {
      ...data,
      twilioAccountSid: data.whatsappEnabled ? data.twilioAccountSid : undefined,
      twilioAuthToken: data.whatsappEnabled ? data.twilioAuthToken : undefined,
      twilioPhoneNumber: data.whatsappEnabled ? data.twilioPhoneNumber : undefined,
    };
    updateSettings.mutate(settingsToUpdate);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black h-screen fixed left-0 p-6">
          <div className="flex items-center gap-2 mb-8">
            <Music2 className="w-8 h-8 text-[#1DB954]" />
            <h1 className="text-xl font-bold">Content Hub</h1>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mb-4"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações globais do sistema
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-semibold">
                      Limites de Solicitações
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="requestLimitPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite diário</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Número máximo de solicitações por dia
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requestLimitPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite semanal</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Número máximo de solicitações por semana
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-semibold">
                      Notificações WhatsApp
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="whatsappEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Ativar notificações</FormLabel>
                            <FormDescription>
                              Habilitar envio de notificações via WhatsApp
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("whatsappEnabled") && (
                      <div className="space-y-4 animate-in fade-in-50">
                        <FormField
                          control={form.control}
                          name="twilioAccountSid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account SID</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="twilioAuthToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Auth Token</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="twilioPhoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número WhatsApp</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Número do WhatsApp configurado no Twilio
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <Button
                type="submit"
                className="w-full bg-[#1DB954] hover:bg-[#1ed760]"
                disabled={updateSettings.isLoading}
              >
                {updateSettings.isLoading
                  ? "Salvando..."
                  : "Salvar Configurações"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}