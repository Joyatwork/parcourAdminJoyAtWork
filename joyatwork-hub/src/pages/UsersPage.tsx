import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersApi, UserAccount } from "@/lib/api";
import axios from "axios";
import { Pencil, Search } from "lucide-react";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("fr-FR");
};

const toDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "-";
    }
  }

  return String(value);
};

const UsersPage = () => {
  const getApiErrorMessage = (error: unknown, fallback: string): string => {
    const responseData = (error as { response?: { data?: unknown } })?.response?.data;
    if (typeof responseData === "string") return responseData;
    if (responseData && typeof responseData === "object") {
      const message = (responseData as { message?: unknown }).message;
      if (typeof message === "string" && message.trim().length > 0) return message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    status: "",
    birth_date: "",
    gender: "",
    bio: "",
  });
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersApi.getAll();
        // Backend returns { value: [...], Count } in some endpoints — normalize to an array
        const payload = response.data;
        const usersArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.value)
          ? payload.value
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        setUsers(usersArray);
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
        setError(getApiErrorMessage(err, "Impossible de charger les utilisateurs."));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.toLowerCase();
      const rawName = String(user.name ?? "").toLowerCase();
      const email = String(user.email ?? "").toLowerCase();
      const phone = String(user.phone ?? "").toLowerCase();
      const role = String(user.role ?? "").toLowerCase();

      return (
        fullName.includes(keyword) ||
        rawName.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }, [users, searchTerm]);

  const totalUsers = useMemo(() => filteredUsers.length, [filteredUsers]);

  const columns: { key: keyof UserAccount; label: string }[] = [
    { key: "id", label: "id" },
    { key: "entreprise_id", label: "entreprise_id" },
    { key: "email", label: "email" },
    { key: "phone", label: "phone" },
    { key: "password_hash", label: "password_hash" },
    { key: "first_name", label: "first_name" },
    { key: "last_name", label: "last_name" },
    { key: "is_active", label: "is_active" },
    { key: "created_at", label: "created_at" },
    { key: "updated_at", label: "updated_at" },
    { key: "name", label: "name" },
    { key: "email_verified_at", label: "email_verified_at" },
    { key: "password", label: "password" },
    { key: "role", label: "role" },
    { key: "remember_token", label: "remember_token" },
    { key: "birth_date", label: "birth_date" },
    { key: "gender", label: "gender" },
    { key: "bio", label: "bio" },
    { key: "avatar", label: "avatar" },
    { key: "preferences", label: "preferences" },
    { key: "health_goals", label: "health_goals" },
    { key: "status", label: "status" },
    { key: "last_login_at", label: "last_login_at" },
    { key: "google_id", label: "google_id" },
    { key: "provider", label: "provider" },
    { key: "avatar_url", label: "avatar_url" },
    { key: "role_id", label: "role_id" },
  ];

  const compactColumns: Array<keyof UserAccount> = [
    "id",
    "entreprise_id",
    "is_active",
    "role_id",
  ];

  const longTextColumns: Array<keyof UserAccount> = [
    "bio",
    "preferences",
    "health_goals",
    "avatar",
    "avatar_url",
    "remember_token",
    "google_id",
    "password",
    "password_hash",
  ];

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [filteredUsers]);

  const openEditDialog = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditForm({
      first_name: String(user.first_name ?? ""),
      last_name: String(user.last_name ?? ""),
      email: String(user.email ?? ""),
      phone: String(user.phone ?? ""),
      password: "",
      role: String(user.role ?? ""),
      status: String(user.status ?? ""),
      birth_date: String(user.birth_date ?? ""),
      gender: String(user.gender ?? ""),
      bio: String(user.bio ?? ""),
    });
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingUserId) {
      return;
    }

    try {
      setSaving(true);

      const payload: Partial<UserAccount> = {
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        name: `${editForm.first_name} ${editForm.last_name}`.trim() || null,
        email: editForm.email || null,
        phone: editForm.phone || null,
        password: editForm.password.trim() ? editForm.password : undefined,
        role: (editForm.role as UserAccount["role"]) || null,
        status: (editForm.status as UserAccount["status"]) || null,
        birth_date: editForm.birth_date || null,
        gender: (editForm.gender as UserAccount["gender"]) || null,
        bio: editForm.bio || null,
      };

      const response = await usersApi.update(editingUserId, payload);
      const updated = response.data;

      setUsers((prev) => prev.map((user) => (user.id === editingUserId ? { ...user, ...updated } : user)));
      setIsEditOpen(false);
      setEditingUserId(null);
    } catch {
      alert("Impossible de modifier cet utilisateur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUserId) {
      return;
    }

    try {
      setDeleting(true);
      const response = await usersApi.delete(editingUserId);
      const action = response?.data?.action;

      if (action === "deactivated") {
        const updatedUser = response?.data?.user as Partial<UserAccount> | undefined;

        if (updatedUser?.id) {
          setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)));
        }

        alert(String(response?.data?.message ?? "Compte désactivé automatiquement."));
      } else {
        setUsers((prev) => prev.filter((user) => user.id !== editingUserId));
      }

      setIsDeleteConfirmOpen(false);
      setIsEditOpen(false);
      setEditingUserId(null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? String(err.response?.data?.message ?? err.message)
        : "Impossible de supprimer ce compte.";
      alert(message);
    } finally {
      setDeleting(false);
    }
  };

  const scrollHorizontally = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollBy({
      left: direction === "right" ? 520 : -520,
      behavior: "smooth",
    });
  };

  const handleCreateAdmin = async () => {
    const payload = {
      first_name: createAdminForm.first_name.trim(),
      last_name: createAdminForm.last_name.trim(),
      email: createAdminForm.email.trim(),
      phone: createAdminForm.phone.trim(),
      password: createAdminForm.password,
    };

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.password) {
      alert("Prénom, nom, email et mot de passe sont obligatoires.");
      return;
    }

    try {
      setCreatingAdmin(true);
      const response = await usersApi.createAdmin(payload);
      const createdUser = response.data;

      setUsers((prev) => [createdUser, ...prev]);
      setCreateAdminForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
      });

      alert("Nouvel administrateur créé avec succès.");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? String(err.response?.data?.message ?? err.message)
        : "Impossible de créer cet administrateur.";
      alert(message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6 mr-8 md:mr-12 xl:mr-16 max-w-[calc(100vw-22rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total comptes: {totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Créer un administrateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <Label>Prénom *</Label>
                <Input
                  value={createAdminForm.first_name}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Ex: Ahmed"
                />
              </div>
              <div>
                <Label>Nom *</Label>
                <Input
                  value={createAdminForm.last_name}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Ex: El Idrissi"
                />
              </div>

              <div>
                <Label>Téléphone</Label>
                <Input
                  value={createAdminForm.phone}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: 0612345678"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={createAdminForm.email}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@joyatwork.com"
                />
              </div>
              <div>
                <Label>Mot de passe *</Label>
                <Input
                  type="password"
                  value={createAdminForm.password}
                  onChange={(e) => setCreateAdminForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Au moins 8 caractères"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleCreateAdmin} disabled={creatingAdmin} className="w-full">
                  {creatingAdmin ? "Création..." : "Créer l'administrateur"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Liste complète</CardTitle>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => scrollHorizontally("left")}>
                  ←
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => scrollHorizontally("right")}>
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 relative max-w-md">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Recherche rapide (nom, email, téléphone, rôle...)"
                className="pl-9"
              />
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement des utilisateurs...</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <div
                ref={scrollContainerRef}
                dir="ltr"
                className="w-full max-h-[72vh] overflow-x-auto overflow-y-auto rounded-md border border-border pr-4"
              >
                <table className="w-full min-w-[3200px] text-xs" dir="ltr">
                  <thead className="sticky top-0 z-10 bg-background [&_tr]:border-b">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap bg-background">
                        modifier
                      </th>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap bg-background"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-top whitespace-nowrap">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                            className="h-8 w-8"
                            aria-label={`Modifier utilisateur ${user.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                        {columns.map((column) => {
                          const value = user[column.key];

                          if (
                            column.key === "created_at" ||
                            column.key === "updated_at" ||
                            column.key === "email_verified_at" ||
                            column.key === "last_login_at"
                          ) {
                            return (
                              <td key={column.key} className="p-4 align-top whitespace-nowrap">
                                {formatDate((value as string | null) ?? null)}
                              </td>
                            );
                          }

                          const isCompact = compactColumns.includes(column.key);
                          const isLongText = longTextColumns.includes(column.key);

                          return (
                            <td
                              key={column.key}
                              className={`p-4 align-top ${
                                isCompact
                                  ? "whitespace-nowrap"
                                  : isLongText
                                    ? "max-w-[280px] whitespace-normal break-words"
                                    : "max-w-[220px] whitespace-normal break-words"
                              }`}
                            >
                              {toDisplayValue(value)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier utilisateur</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'utilisateur sélectionné.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Prénom</Label>
              <Input value={editForm.first_name} onChange={(e) => setEditForm((prev) => ({ ...prev, first_name: e.target.value }))} />
            </div>
            <div>
              <Label>Nom</Label>
              <Input value={editForm.last_name} onChange={(e) => setEditForm((prev) => ({ ...prev, last_name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Nouveau mot de passe</Label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>
            <div>
              <Label>Rôle</Label>
              <Select
                value={editForm.role || undefined}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="practitioner">practitioner</SelectItem>
                  <SelectItem value="enterprise">enterprise</SelectItem>
                  <SelectItem value="employee">employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editForm.status || undefined}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                  <SelectItem value="suspended">suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date de naissance</Label>
              <Input type="date" value={editForm.birth_date} onChange={(e) => setEditForm((prev) => ({ ...prev, birth_date: e.target.value }))} />
            </div>
            <div>
              <Label>Genre</Label>
              <Select
                value={editForm.gender || undefined}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">male</SelectItem>
                  <SelectItem value="female">female</SelectItem>
                  <SelectItem value="other">other</SelectItem>
                  <SelectItem value="prefer_not_to_say">prefer_not_to_say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Input value={editForm.bio} onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={saving || deleting}
            >
              {deleting ? "Suppression..." : "Supprimer le compte"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={saving || deleting}>
              Annuler
            </Button>
            <Button type="button" onClick={handleEditSave} disabled={saving || deleting}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. Le compte utilisateur sera supprimé de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Suppression..." : "Confirmer la suppression"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
