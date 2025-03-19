import { PrismaClient, Group, ProficiencyLevel } from "@prisma/client";
import { Request } from "express";
import { CreateGroupDTO } from "../../types/group";

const prisma = new PrismaClient();

interface GetAllQueryParams {
  limit?: number;
  page?: number;
  queryName?: string;
  searchQuery?: string;
  sort?: string;
}

export const Create = async (data: CreateGroupDTO): Promise<Group> => {
  const { levels, languages, ...rest } = data;
  const response = await prisma.group.create({
    data: {
      ...rest,
      levels: {
        connect: levels.map((level) => ({ name: level as ProficiencyLevel })),
      },
      languages: { connect: languages.map((language) => ({ name: language })) },
    },
  });
  return response;
};

export const GetAll = async (req: Request): Promise<Group[]> => {
  const { limit, page, searchQuery } = req.query as GetAllQueryParams;
  const skip = (Number(page) - 1) * (Number(limit) || 10) || 5;
  let filter: any = {};

  if (searchQuery) {
    filter = {
      OR: [
        { topic: { contains: searchQuery, mode: "insensitive" } },
        { languages: { has: searchQuery } },
      ],
    };
  }

  const response = await prisma.group.findMany({
    where: filter,
    skip: skip,
    take: Number(limit) || 10,
    orderBy: {
      createdAt: "desc",
    },
  });
  return response;
};

export const DeleteOne = async (req: Request): Promise<void> => {
  const { id } = req.params;
  await prisma.group.delete({
    where: {
      id: id,
    },
  });
};
