import { HttpError } from "../errors/HttpError.js";
import { PrismaServicoRepository } from "../repositories/prisma/PrismaServicoRepository.js";

interface GetServicesParams {
  idBarbearia: number;
  page?: number;
  pageSize?: number;
  nome?: string;
  descricao?: string;
  sortBy?: "nome" | "descricao" | "preco" | "duracaoMin";
  order?: "asc" | "desc";
}

interface CreateServiceParams {
  idBarbearia: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMin: number;
}

interface UpdateServiceParams {
  idBarbearia: number;
  idServico: number;
  nome?: string;
  descricao?: string;
  preco?: number;
  duracaoMin?: number;
}

const servicoRepository = new PrismaServicoRepository();

export class ServiceService {
  async getServices(params: GetServicesParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      servicoRepository.find({
        where: {
          idBarbearia: params.idBarbearia,
          nome: params.nome ? { like: params.nome } : undefined,
          descricao: params.descricao ? { like: params.descricao } : undefined,
        },
        sortBy: params.sortBy,
        order: params.order,
        limit: pageSize,
        offset,
      }),
      servicoRepository.count({
        idBarbearia: params.idBarbearia,
        nome: params.nome ? { like: params.nome } : undefined,
        descricao: params.descricao ? { like: params.descricao } : undefined,
      }),
    ]);

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getServiceById(idBarbearia: number, idServico: number) {
    const servico = await servicoRepository.findById(idServico, idBarbearia);

    if (!servico) {
      throw new HttpError(404, "Servico nao encontrado");
    }

    return servico;
  }

  async createService(data: CreateServiceParams) {
    return servicoRepository.create({
      idBarbearia: data.idBarbearia,
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      duracaoMin: data.duracaoMin,
    });
  }

  async updateService(data: UpdateServiceParams) {
    const servico = await servicoRepository.updateById(data.idServico, data.idBarbearia, {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      duracaoMin: data.duracaoMin,
    });

    if (!servico) {
      throw new HttpError(404, "Servico nao encontrado");
    }

    return servico;
  }

  async deleteService(idBarbearia: number, idServico: number) {
    const servico = await servicoRepository.deleteById(idServico, idBarbearia);

    if (!servico) {
      throw new HttpError(404, "Servico nao encontrado");
    }

    return servico;
  }
}
