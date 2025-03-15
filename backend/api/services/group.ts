// const Model = require("../models/group");

// const { PrismaClient } = require("@prisma/client");
// // import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// exports.Create = async (data) => {
//   // const response = await Model.create(data);
//   const response = await prisma.group.create({
//     data: data,
//   });

//   return response;
// };

// exports.GetAll = async (req) => {
//   const { limit, page, queryName, searchQuery, sort } = req.query;
//   const skip = (page - 1) * (limit || 10);
//   let filter = {};

//   if (searchQuery) {
//     const regex = new RegExp(searchQuery, "i");

//     filter = {
//       $or: [
//         { title: { $regex: regex } },
//         { Topic: { $regex: regex } },
//         { language: { $regex: regex } },
//       ],
//     };
//   }

//   // const response = await Model.find(filter)
//   //   .sort({ createdAt: -1 })
//   //   .skip(skip || 0)
//   //   .limit(limit || 1000);
//   // // .populate("equbType")

//   const response = await prisma.group.findMany({
//     where: filter,
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
//   return response;
// };

// exports.DeleteOne = async (req) => {
//   const { id } = req.params;
//   const response = await Model.deleteOne({
//     _id: id,
//   });

//   return response;
// };

import { PrismaClient, Group } from "@prisma/client";
import { Request } from "express";
import { GroupRequestBody } from "../validations/group";

const prisma = new PrismaClient();

interface GetAllQueryParams {
  limit?: number;
  page?: number;
  queryName?: string;
  searchQuery?: string;
  sort?: string;
}

export const Create = async (data: GroupRequestBody): Promise<Group> => {
  const { levels, languages, ...rest } = data;
  const response = await prisma.group.create({
    data: rest,
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
