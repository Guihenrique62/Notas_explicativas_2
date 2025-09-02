import { prisma } from "../prismaClient";

interface CreateGroupCompaniesInput {
  name: string
}

interface UpdateGroupCompaniesInput {
  groupId: string
  name?: string
  companyIds?: string[]
  userIds?: string[]
}

//Create Group of Companies
export const createGroupCompanies = async (data: CreateGroupCompaniesInput) => {

  const group = await prisma.groupCompanies.create({
    data: {
      name: data.name,
    },
  });

  return group;
}

// List groups
export const listGroups = async () => {
  return prisma.groupCompanies.findMany({
    include: {
      companies: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
  });
};

//Atribute user to group
export const updateGroup = async ({ userIds, companyIds, name, groupId }: UpdateGroupCompaniesInput) => {
  const group = await prisma.groupCompanies.findFirst({ where: { id: groupId } });
  if (!group) throw new Error('Grupo inexistente');

  if (!userIds && !companyIds && !name) throw new Error('Sem dados para atualizar');

  const data: any = {};

  if (name) data.name = name;
  if (companyIds) {
    data.companies = {
      set: [], // Remove all current company
      connect: companyIds.map(id => ({ id }))
    };
  }
  if (userIds) {
    data.users = {
      set: [], // Remove all current users
      connect: userIds.map(id => ({ id }))
    };
  }

  const updatedGroup = await prisma.groupCompanies.update({
    where: { id: groupId },
    data,
    include: { companies: true, users: true }
  });

  return updatedGroup;
}

export const deleteGroup = async (groupId: string)=> {

  const group = await prisma.groupCompanies.findUnique({ where: { id: groupId } })
  if (!group) throw new Error('Grupo não encontrado!')

  await prisma.groupCompanies.delete({ where: { id: groupId } })

  return {
    id: group.id,
    name: group.name,
    createdAt: group.createdAt
  }

}