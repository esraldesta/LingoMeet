import { PrismaClient } from "@prisma/client";
import { languages, levels } from "./group";

const prisma = new PrismaClient();

async function main() {
  await prisma.language.createMany({
    data: languages,
  });

  await prisma.level.createMany({
    data: levels,
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
