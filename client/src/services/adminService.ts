import { api } from "./api";
import {
  AdminStats,
  AdminGameSortField,
  AdminUserSortField,
  SortOrder,
} from "@/types/admin";
import {
  getAdminCollectionPayload,
  mapAdminGameFromApi,
  mapAdminStatsFromApi,
  mapAdminUserFromApi,
  mapPaginationFromApi,
  mapStatusFilterToApi,
} from "./mappers";

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>("/admin/stats");
    return mapAdminStatsFromApi(response.data);
  },

  async getUsers(
    page: number = 1,
    search: string = "",
    sortBy: AdminUserSortField = "createdAt",
    sortOrder: SortOrder = "desc",
  ) {
    const normalizedSearch = search.trim();
    const response = await api.get("/admin/users", {
      params: {
        page,
        limit: 20,
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
        sortBy,
        sortOrder,
      },
    });
    const payload = getAdminCollectionPayload(response.data);

    return {
      ...payload,
      users: (payload.users ?? payload.data?.users ?? []).map(
        mapAdminUserFromApi,
      ),
      pagination: mapPaginationFromApi(payload.pagination),
    };
  },

  async updateUser(
    userId: string,
    data: { elo?: number; role?: "USER" | "ADMIN" },
  ) {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string) {
    await api.delete(`/admin/users/${userId}`);
  },

  async getGames(
    page: number = 1,
    status: string = "",
    sortBy: AdminGameSortField = "createdAt",
    sortOrder: SortOrder = "desc",
  ) {
    const normalizedStatus = status.trim();
    const response = await api.get("/admin/games", {
      params: {
        page,
        limit: 20,
        ...(normalizedStatus
          ? { status: mapStatusFilterToApi(normalizedStatus) }
          : {}),
        sortBy,
        sortOrder,
      },
    });
    const payload = getAdminCollectionPayload(response.data);

    return {
      ...payload,
      games: (payload.games ?? payload.data?.games ?? []).map(
        mapAdminGameFromApi,
      ),
      pagination: mapPaginationFromApi(payload.pagination),
    };
  },

  async deleteGame(gameId: string) {
    await api.delete(`/admin/games/${gameId}`);
  },
};
