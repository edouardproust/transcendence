import React, { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { pushToast } from "@/components/ui/ToastProvider";
import { useAuthStore } from "@/features/auth/authStore";
import { AdminUser, AdminUserSortField, SortOrder } from "@/types/admin";
import { getApiErrorMessage } from "@/utils/apiError";

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [sortBy, setSortBy] = useState<AdminUserSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editElo, setEditElo] = useState("");
  const [editRole, setEditRole] = useState<"USER" | "ADMIN">("USER");

  useEffect(() => {
    void loadUsers();
  }, [pagination.page, appliedSearch, sortBy, sortOrder]);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.getUsers(
        pagination.page,
        appliedSearch,
        sortBy,
        sortOrder,
      );
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error("Error loading users:", error);
      const backendMessage = error.response?.data?.message;
      setUsers([]);
      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(", ")
          : backendMessage || "No se pudieron cargar los usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const normalizedSearch = search.trim();

    if (normalizedSearch.length === 1) {
      pushToast("Ingresa al menos 2 caracteres para buscar.", "error");
      return;
    }

    setPagination((current) => ({ ...current, page: 1 }));
    setAppliedSearch(normalizedSearch);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditElo(String(user.elo));
    setEditRole(user.role);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    const parsedElo = Number.parseInt(editElo, 10);

    try {
      await adminService.updateUser(editingUser.id, {
        elo: Number.isNaN(parsedElo) ? undefined : parsedElo,
        role: editingUser.id === currentUser?.id ? undefined : editRole,
      });
      pushToast("Usuario actualizado", "success");
      setEditingUser(null);
      void loadUsers();
    } catch (error: any) {
      pushToast(
        getApiErrorMessage(error, "Error actualizando usuario"),
        "error",
      );
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (
      !confirm(`¿Eliminar usuario ${username}? Esta acción es irreversible.`)
    ) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      pushToast("Usuario eliminado", "success");
      void loadUsers();
    } catch (error: any) {
      pushToast(getApiErrorMessage(error, "Error eliminando usuario"), "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando usuarios...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="text-xl font-semibold text-red-700">
            Error cargando usuarios
          </div>
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          <Button
            className="mt-4"
            variant="danger"
            onClick={() => void loadUsers()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        👥 Gestión de Usuarios
      </h1>

      {/* Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px_auto]">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setSortBy(e.target.value as AdminUserSortField);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="createdAt">Mas recientes</option>
            <option value="username">Usuario</option>
            <option value="email">Email</option>
            <option value="elo">ELO</option>
            <option value="role">Rol</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => {
              setPagination((current) => ({ ...current, page: 1 }));
              setSortOrder(e.target.value as SortOrder);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
          <Button onClick={handleSearch}>Buscar</Button>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Busqueda con paginacion, filtros y ordenacion por usuario, email, ELO,
          rol o fecha.
        </p>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Usuario
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  ELO
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Rol
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Partidas
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Registrado
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 px-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No se encontraron usuarios para esta búsqueda.
                  </td>
                </tr>
              )}
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <tr
                    key={user.id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                      {user.username}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {user.elo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {user.role === "ADMIN" ? "👑 Admin" : "👤 User"}
                      </span>
                      {isCurrentUser && (
                        <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          Tu cuenta
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {user.total_games}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          disabled={isCurrentUser}
                          onClick={() =>
                            void handleDelete(user.id, user.username)
                          }
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {users.length} de {pagination.total} usuarios
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Editar Usuario: {editingUser.username}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  ELO Rating
                </label>
                <input
                  type="number"
                  value={editElo}
                  onChange={(e) => setEditElo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Rol
                </label>
                <select
                  value={editRole}
                  onChange={(e) =>
                    setEditRole(e.target.value as "USER" | "ADMIN")
                  }
                  disabled={editingUser.id === currentUser?.id}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {editingUser.id === currentUser?.id && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tu propio rol no se puede degradar desde esta pantalla.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => void handleSaveEdit()}>
                Guardar Cambios
              </Button>
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
