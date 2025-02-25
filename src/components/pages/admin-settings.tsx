"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const settingsSchema = z.object({
  requestLimitPerDay: z.number().min(1),
  requestLimitPerWeek: z.number().min(1),
  whatsappEnabled: z.boolean(),
  twilioAccountSid: z.string().min(1, "Account SID é obrigatório"),
  twilioAuthToken: z.string().min(1, "Auth Token é obrigatório"),
  twilioPhoneNumber: z.string().min(1, "Número é obrigatório"),
});

export function AdminSettings() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      requestLimitPerDay: 10,
      requestLimitPerWeek: 50,
      whatsappEnabled: true,
      twilioAccountSid: "",
      twilioAuthToken: "",
      twilioPhoneNumber: "",
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) throw new Error("Failed to load settings");
        const data = await response.json();
        form.reset(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar configurações",
          description: "Tente novamente mais tarde",
        });
      }
    };
    loadSettings();
  }, []);

  const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast({
        title: "Configurações salvas",
        description: "As alterações foram aplicadas com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar configurações",
        description: "Tente novamente mais tarde",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Configurações do Sistema</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Limites de Solicitações</h2>
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

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Notificações WhatsApp</h2>
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
                <>
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
                </>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            Salvar Configurações
          </Button>
        </form>
      </Form>
    </div>
  );
}