// prisma/seed.js
import { PrismaClient, UserRole, AppointmentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash da senha padrão
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Criar admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      role: UserRole.admin,
    },
  });

  // Criar usuário com cliente
  const userClient = await prisma.user.create({
    data: {
      email: "client@example.com",
      password: hashedPassword,
      role: UserRole.user,
      client: {
        create: {
          name: "João da Silva",
          phone: "11999999999",
          address: "Rua A, 123",
          cpf: 12345678901,
        },
      },
    },
    include: { client: true },
  });

  // Criar usuário com barbeiro
  const userBarber = await prisma.user.create({
    data: {
      email: "barber@example.com",
      password: hashedPassword,
      role: UserRole.user,
      barber: {
        create: {
          name: "Carlos Barber",
          phone: "11888888888",
          cpf: 98765432100,
        },
      },
    },
    include: { barber: true },
  });

  // Criar produtos
  const product1 = await prisma.product.create({
    data: {
      name: "Shampoo Premium",
      price: 29.9,
      stock: 100,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Tesoura Profissional",
      price: 99.9,
      stock: 50,
    },
  });

  // Criar agendamento
  await prisma.appointment.create({
    data: {
      date: new Date(),
      status: AppointmentStatus.confirmed,
      clientId: userClient.client.id,
      barberId: userBarber.barber.id,
    },
  });

  // Criar venda
  await prisma.sale.create({
    data: {
      clientId: userClient.client.id,
      barberId: userBarber.barber.id,
      productId: product1.id,
      quantity: 2,
      total: 2 * product1.price,
    },
  });

  console.log("✅ Seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error while seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
