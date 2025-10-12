
interface GetClientWithPaginationParams {
    page?: number
    pageSize?: number
    name?: string
    cpf?: string
    phone?: string
    sortBy?: "name" | "createdAt" | "updatedAt"
    order?: "asc" | "desc"
}

export class ClientService {
    async getClientWithPagination(params: GetClientWithPaginationParams) {
        // Your logic to retrieve users with pagination goes here
    }
}