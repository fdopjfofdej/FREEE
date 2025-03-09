import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Flag, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from 'react-i18next';

const reportSchema = z.object({
  reason: z.string({
    required_error: "Veuillez sélectionner une raison",
  }),
  details: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportDialogProps {
  carId: string;
  isAuthenticated: boolean;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

const REPORT_REASONS = [
  { value: "fraudulent", labelKey: "Annonce frauduleuse" },
  { value: "inappropriate", labelKey: "Contenu inapproprié" },
  { value: "misleading", labelKey: "Information trompeuse" },
  { value: "duplicate", labelKey: "Annonce en double" },
  { value: "spam", labelKey: "Spam" },
  { value: "other", labelKey: "Autre raison" },
];

export function ReportDialog({
  carId,
  variant = "ghost",
  size = "sm",
  className,
  children,
}: ReportDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
      details: "",
    },
  });

  const onSubmit = async (data: ReportFormValues) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase.rpc("report_car", {
        p_car_id: carId,
        p_reason: data.reason,
        p_details: data.details || null,
      });

      if (error) throw error;

      toast({
        title: t("Signalement envoyé"),
        description: t("Merci pour votre signalement. Notre équipe va l'examiner."),
      });

      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Error reporting car:", error);
      toast({
        title: t("Erreur"),
        description: error.message || t("Une erreur est survenue lors de l'envoi du signalement"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={variant} size={size} className={className}>
            <Flag className="h-4 w-4 mr-2" />
            {t("Signaler cette annonce")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t("Signaler cette annonce")}
          </DialogTitle>
          <DialogDescription>
            {t("Aidez-nous à maintenir la qualité des annonces en signalant les contenus problématiques.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Raison du signalement')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Sélectionnez une raison')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REPORT_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {t(reason.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Détails (optionnel)')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('Décrivez le problème plus en détail...')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('Envoi en cours...')}
                  </>
                ) : (
                  t('Envoyer le signalement')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}