import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PushNotificationSettings() {
  const { user } = useAuth();
  const {
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  const openInNewTab = () => {
    try {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    } catch {
      // noop
    }
  };

  // Vérifie si une souscription existe déjà en base
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user) return;

      const { data } = await supabase.from("push_subscriptions").select("id").eq("user_id", user.id).maybeSingle();

      setIsEnabled(!!data);
    };

    checkExistingSubscription();
  }, [user, subscription]);

  const handleToggle = async (enabled: boolean) => {
    if (!user) {
      toast.error("Vous devez être connecté pour activer les notifications");
      return;
    }

    if (enabled && isInIframe) {
      toast.error("Ouvrez l'app dans un nouvel onglet pour activer les notifications");
      return;
    }

    setIsSaving(true);

    try {
      if (enabled) {
        const perm = await requestPermission();

        if (perm !== "granted") {
          toast.error("Vous devez autoriser les notifications dans votre navigateur");
          return;
        }

        const newSubscription = await subscribe();

        if (newSubscription) {
          const subscriptionJson = newSubscription.toJSON();

          const { error: dbError } = await supabase.from("push_subscriptions").upsert(
            {
              user_id: user.id,
              endpoint: subscriptionJson.endpoint!,
              p256dh: subscriptionJson.keys!.p256dh,
              auth: subscriptionJson.keys!.auth,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "endpoint", // ✅ FIX ICI
            },
          );

          if (dbError) {
            console.error("Error saving subscription:", dbError);
            toast.error(dbError.message);
          } else {
            setIsEnabled(true);
            toast.success("Notifications push activées !");
          }
        }
      } else {
        const success = await unsubscribe();

        if (success) {
          await supabase.from("push_subscriptions").delete().eq("user_id", user.id);

          setIsEnabled(false);
          toast.success("Notifications push désactivées");
        }
      }
    } catch (err) {
      console.error("Error toggling push notifications:", err);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = () => {
    sendTestNotification();
    toast.success("Notification test envoyée !");
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Notifications non supportées</p>
          <p className="text-xs text-muted-foreground">Votre navigateur ne supporte pas les notifications push</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isInIframe && (
        <div className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Activation depuis l'aperçu</p>
              <p className="text-xs text-muted-foreground">
                Ouvrez l'application dans un nouvel onglet pour activer les notifications.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            Ouvrir
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="push-notifications" className="cursor-pointer">
              Notifications push natives
            </Label>
            <p className="text-xs text-muted-foreground">Recevez des alertes même quand l'app est fermée</p>
          </div>
        </div>

        <Switch
          id="push-notifications"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading || isSaving}
        />
      </div>

      {permission === "denied" && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">Notifications bloquées. Vérifiez les paramètres du navigateur.</span>
        </div>
      )}

      {isEnabled && permission === "granted" && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Notifications actives</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleTestNotification} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tester"}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
