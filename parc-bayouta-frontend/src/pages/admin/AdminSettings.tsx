import { useState } from "react";
import { Save, Building, Clock, Link as LinkIcon, User, Lock, Globe, Phone, Mail, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Park Information
  const [parkInfo, setParkInfo] = useState({
    name: "Parc Bayouta",
    address: "Route de la Plage, El Alia, Skikda, Algérie",
    phone: "+213 555 123 456",
    whatsapp: "+213 555 123 456",
    email: "contact@parcbayouta.dz",
    description: "Votre destination familiale pour le sport, les loisirs et les événements à El Alia."
  });

  // Opening Hours
  const [openingHours, setOpeningHours] = useState({
    weekdays: "08:00 - 23:00",
    friday: "14:00 - 23:00",
    weekend: "08:00 - 00:00"
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com/parcbayouta",
    instagram: "https://instagram.com/parcbayouta",
    tiktok: ""
  });

  // Homepage Content
  const [homeContent, setHomeContent] = useState({
    heroTitle: "Parc Bayouta",
    heroSubtitle: "Sport, Détente et Événements à El Alia",
    heroDescription: "Découvrez un espace unique dédié aux loisirs en famille, au sport et aux célébrations. Terrains de mini-foot, salle des fêtes et café-restaurant vous attendent."
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSaveParkInfo = () => {
    toast({
      title: "Informations sauvegardées",
      description: "Les informations du parc ont été mises à jour avec succès.",
    });
  };

  const handleSaveOpeningHours = () => {
    toast({
      title: "Horaires sauvegardés",
      description: "Les horaires d'ouverture ont été mis à jour avec succès.",
    });
  };

  const handleSaveSocialLinks = () => {
    toast({
      title: "Liens sauvegardés",
      description: "Les liens vers les réseaux sociaux ont été mis à jour avec succès.",
    });
  };

  const handleSaveHomeContent = () => {
    toast({
      title: "Contenu sauvegardé",
      description: "Le contenu de la page d'accueil a été mis à jour avec succès.",
    });
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été changé avec succès.",
    });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les paramètres du site et votre compte</p>
        </div>

        <Tabs defaultValue="park" className="space-y-6">
          <TabsList className="w-full flex justify-start overflow-x-auto h-auto p-1 bg-muted/50">
            <TabsTrigger value="park" className="flex-1 sm:flex-none">Parc</TabsTrigger>
            <TabsTrigger value="hours" className="flex-1 sm:flex-none">Horaires</TabsTrigger>
            <TabsTrigger value="social" className="flex-1 sm:flex-none">Réseaux</TabsTrigger>
            <TabsTrigger value="home" className="flex-1 sm:flex-none">Accueil</TabsTrigger>
            <TabsTrigger value="account" className="flex-1 sm:flex-none">Compte</TabsTrigger>
          </TabsList>

          {/* Park Information */}
          <TabsContent value="park">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informations du Parc
                </CardTitle>
                <CardDescription>
                  Informations générales affichées sur le site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du parc</Label>
                    <Input
                      value={parkInfo.name}
                      onChange={(e) => setParkInfo({ ...parkInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={parkInfo.email}
                        onChange={(e) => setParkInfo({ ...parkInfo, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={parkInfo.phone}
                        onChange={(e) => setParkInfo({ ...parkInfo, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={parkInfo.whatsapp}
                        onChange={(e) => setParkInfo({ ...parkInfo, whatsapp: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label>Adresse</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        value={parkInfo.address}
                        onChange={(e) => setParkInfo({ ...parkInfo, address: e.target.value })}
                        className="pl-10"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label>Description courte</Label>
                    <Textarea
                      value={parkInfo.description}
                      onChange={(e) => setParkInfo({ ...parkInfo, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveParkInfo}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opening Hours */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horaires d'ouverture
                </CardTitle>
                <CardDescription>
                  Définissez les horaires affichés sur le site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Lundi - Jeudi</Label>
                    <Input
                      value={openingHours.weekdays}
                      onChange={(e) => setOpeningHours({ ...openingHours, weekdays: e.target.value })}
                      placeholder="08:00 - 23:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendredi</Label>
                    <Input
                      value={openingHours.friday}
                      onChange={(e) => setOpeningHours({ ...openingHours, friday: e.target.value })}
                      placeholder="14:00 - 23:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Samedi - Dimanche</Label>
                    <Input
                      value={openingHours.weekend}
                      onChange={(e) => setOpeningHours({ ...openingHours, weekend: e.target.value })}
                      placeholder="08:00 - 00:00"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveOpeningHours}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Réseaux Sociaux
                </CardTitle>
                <CardDescription>
                  Liens vers vos pages sur les réseaux sociaux
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={socialLinks.facebook}
                        onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                        className="pl-10"
                        placeholder="https://facebook.com/votrepagp"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={socialLinks.instagram}
                        onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                        className="pl-10"
                        placeholder="https://instagram.com/votrepage"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>TikTok</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={socialLinks.tiktok}
                        onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                        className="pl-10"
                        placeholder="https://tiktok.com/@votrepage"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSocialLinks}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homepage Content */}
          <TabsContent value="home">
            <Card>
              <CardHeader>
                <CardTitle>Contenu de l'Accueil</CardTitle>
                <CardDescription>
                  Personnalisez le contenu affiché sur la page d'accueil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre principal (Hero)</Label>
                    <Input
                      value={homeContent.heroTitle}
                      onChange={(e) => setHomeContent({ ...homeContent, heroTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sous-titre</Label>
                    <Input
                      value={homeContent.heroSubtitle}
                      onChange={(e) => setHomeContent({ ...homeContent, heroSubtitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={homeContent.heroDescription}
                      onChange={(e) => setHomeContent({ ...homeContent, heroDescription: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveHomeContent}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom d'utilisateur</Label>
                      <Input value={user?.username || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Rôle</Label>
                      <Input value={user?.role === 'admin' ? 'Administrateur' : 'Staff'} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Changer le mot de passe
                  </CardTitle>
                  <CardDescription>
                    Utilisez un mot de passe fort d'au moins 8 caractères
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mot de passe actuel</Label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Nouveau mot de passe</Label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmer le nouveau mot de passe</Label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword}>
                      <Lock className="w-4 h-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
