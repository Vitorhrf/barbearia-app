import { Client } from "@prisma/client";
import { ClientsRepository, ClientWhereParams, CreateClientsAttributes, FindClientsParams } from "../ClientRepository";
import { prisma } from "../../database";
import bcrypt from "bcrypt";

export class PrismaClientRepository implements ClientsRepository{
    find(params: FindClientsParams): Promise<Client[]>{
        return prisma.client.findMany({
            where: {
                ...params.where
            },
            orderBy: {
                [params.sortBy || "createdAt"]: params.order || "asc"
            },
            take: params.limit,
            skip: params.offset,
            include: {
                    appointments: true,
                    sales: true,
                    user: {
                    select: {
                        email: true
                    }
                }
            }
        });
    }

    findById(id: number): Promise<Client | null>{
        return prisma.client.findUnique({
            where: {
                id
            },
            include: {
                appointments: true,
                sales: true,
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });
    }

    async create(data: CreateClientsAttributes): Promise<Client>{
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: await bcrypt.hash(data.password, 10),
                role: "user"
            }
        })

        const client = await prisma.client.create({
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
                cpf: data.cpf,
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        })

        return client
    }

    count(where: ClientWhereParams): Promise<number>{

    }

    updateById(id: number, data: Partial<CreateClientsAttributes>): Promise<Client | null>{

    }

    deleteById(id: number): Promise<Client | null>{

    }

    
}