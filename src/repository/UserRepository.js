// src/repository/UserRepository.js

const prisma = require("../config/prisma.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class UserRepository {
  // [CREATE]
  async create(userData) {
    const { email, name, phone, password, userType } = userData;

    // Hashing da senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword, // Salva o hash!
        userType: userType || "CLIENT",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  }
  async findByEmailWithPassword(email) {
    return prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        password: true, // ESSENCIAL: precisa do hash para login
        userType: true, // ESSENCIAL: para Autorização (role)
        name: true,
      },
    });
  }

  // [READ ONE]
  async findById(id) {
    return prisma.user.findUnique({
      where: {
        id: BigInt(id),
      },
      select: {
        // Seleciona os mesmos campos do create
        id: true,
        name: true,
        phone: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // [READ ALL]
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // [UPDATE]
  async update(id, userData) {
    return prisma.user.update({
      where: {
        id: BigInt(id),
      },
      data: userData, // Recebe o objeto com os campos a serem alterados
      select: {
        id: true,
        name: true,
        phone: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // [DELETE]
  async delete(id) {
    // Retorna o objeto deletado
    return prisma.user.delete({
      where: {
        id: BigInt(id),
      },
      select: {
        id: true,
        name: true,
        userType: true,
      },
    });
  }
}

module.exports = new UserRepository();
