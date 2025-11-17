"use server";
import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

const inputSchema = z.object({
  serviceId: z.uuid(),
  date: z.date(),
});

export const createBooking = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { serviceId, date } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // início e fim do dia baseado no date enviado
    const start = startOfDay(date);
    const end = endOfDay(date);

    if (!session?.user) {
      returnValidationErrors(inputSchema, {
        _errors: ["Unauthorized"],
      });
    }

    const service = await prisma.barbershopService.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      returnValidationErrors(inputSchema, {
        _errors: ["Service not found"],
      });
    }

    // verificar se já existe agendamento para essa data
    const existingBooking = await prisma.booking.findFirst({
      where: {
        barbershopId: service.barbershopId,
        date,
      },
    });

    if (existingBooking) {
      console.error("Já existe um agendamento para essa data.");
      returnValidationErrors(inputSchema, {
        _errors: ["Já existe um agendamento para essa data."],
      });
    }

    // verificar se o usuário já possui agendamento no mesmo horário
    const userHasBookingSameTime = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        date,
      },
    });

    if (userHasBookingSameTime) {
      returnValidationErrors(inputSchema, {
        _errors: ["Você já possui um agendamento neste horário."],
      });
    }

    const userHasBookingSameDay = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    if (userHasBookingSameDay) {
      returnValidationErrors(inputSchema, {
        _errors: ["Você já possui um agendamento neste dia."],
      });
    }

    // verificar se o usuário já possui um agendamento ativo para este serviço,
    // independentemente da barbearia
    const activeDuplicateServiceBooking = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        serviceId,
        OR: [{ cancelled: false }, { cancelled: null }],
      },
    });

    if (activeDuplicateServiceBooking) {
      returnValidationErrors(inputSchema, {
        _errors: ["Você já possui um agendamento ativo para este serviço."],
      });
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        date,
        userId: session.user.id,
        barbershopId: service.barbershopId,
      },
    });

    return booking;
  });
