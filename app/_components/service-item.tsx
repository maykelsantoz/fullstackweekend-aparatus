"use client";
import { useQuery } from "@tanstack/react-query";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Barbershop, BarbershopService } from "../../generated/prisma/client";
import { createBooking } from "../_actions/create-booking";
import { createBookingCheckoutSession } from "../_actions/create-booking-checkout-session";
import { getDateAvailableTimeSlots } from "../_actions/get-date-available-time-slots";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Separator } from "./ui/separator";

interface ServiceItemProps {
  service: BarbershopService & {
    barbershop: Barbershop;
  };
}

/* Hook para fechar o sheet ao pressionar voltar */
// function useCloseOnBack(open: boolean, onClose: () => void) {
//   useEffect(() => {
//     if (!open) return;

//     window.history.pushState({ sheet: true }, "");

//     const handler = () => {
//       onClose();
//     };

//     window.addEventListener("popstate", handler);

//     return () => {
//       window.removeEventListener("popstate", handler);

//       if (window.history.state?.sheet) {
//         window.history.replaceState(null, "");
//       }
//     };
//   }, [open, onClose]);
// }
function useCloseOnBack(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    // Marca o estado atual sem empilhar
    window.history.replaceState({ sheetOpen: true }, "");

    const handler = () => {
      onClose();
      // Remove o flag pra não gerar loop
      window.history.replaceState(null, "");
    };

    window.addEventListener("popstate", handler);

    return () => {
      window.removeEventListener("popstate", handler);
      window.history.replaceState(null, "");
    };
  }, [open, onClose]);
}

export function ServiceItem({ service }: ServiceItemProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const { executeAsync, isPending } = useAction(createBooking);
  const { executeAsync: executeCreateBookingCheckoutSession } = useAction(
    createBookingCheckoutSession,
  );
  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  const { data: availableTimeSlots } = useQuery({
    queryKey: ["date-available-time-slots", service.barbershopId, selectedDate],
    queryFn: () =>
      getDateAvailableTimeSlots({
        barbershopId: service.barbershopId,
        date: selectedDate!,
      }),
    enabled: Boolean(selectedDate),
  });

  // trava scroll do body
  useEffect(() => {
    document.body.style.overflow = sheetIsOpen ? "hidden" : "";
  }, [sheetIsOpen]);

  const handleSheetChange = (isOpen: boolean) => {
    setSheetIsOpen(isOpen);
    if (!isOpen) {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  };

  // botão voltar do Android/iOS
  useCloseOnBack(sheetIsOpen, () => handleSheetChange(false));

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const priceInReais = (service.priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const priceInReaisInteger = Math.floor(service.priceInCents / 100);
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : "";

  const isConfirmDisabled = !selectedDate || !selectedTime;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleConfirm = async () => {
    if (!selectedTime || !selectedDate) return;

    const [hours, minutes] = selectedTime.split(":");
    const date = new Date(selectedDate);
    date.setHours(Number(hours), Number(minutes));

    const checkoutSession = await executeCreateBookingCheckoutSession({
      serviceId: service.id,
      date,
    });

    if (checkoutSession.serverError || checkoutSession.validationErrors) {
      toast.error(checkoutSession.validationErrors?._errors?.[0]);
      return;
    }

    const result = await executeAsync({
      serviceId: service.id,
      date,
    });

    if (result.serverError || result.validationErrors) {
      toast.error(result.validationErrors?._errors?.[0]);
      return;
    }

    toast.success("Agendamento criado com sucesso!");
    handleSheetChange(false);
  };

  return (
    <>
      <div className="border-border bg-card flex items-center justify-center gap-3 rounded-2xl border border-solid p-3">
        <div className="relative size-[110px] shrink-0 overflow-hidden rounded-[10px]">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex grow basis-0 flex-row items-center self-stretch">
          <div className="relative flex h-full min-h-0 min-w-0 grow basis-0 flex-col items-start justify-between">
            <div className="flex h-[67.5px] w-full flex-col items-start gap-1 text-sm leading-[1.4]">
              <p className="text-card-foreground w-full font-bold">
                {service.name}
              </p>
              <p className="text-muted-foreground w-full font-normal">
                {service.description}
              </p>
            </div>

            <div className="flex w-full items-center justify-between">
              <p className="text-card-foreground text-sm leading-[1.4] font-bold whitespace-pre">
                {priceInReais}
              </p>

              <Button
                className="rounded-full px-4 py-2"
                onClick={() => handleSheetChange(true)}
              >
                Reservar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BottomSheet REAL */}
      <BottomSheet open={sheetIsOpen} onOpenChange={handleSheetChange}>
        <div className="flex h-full flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6">
            <div>
              <p className="text-lg font-bold">Fazer Reserva</p>
              <p className="text-muted-foreground">{service.name}</p>
            </div>

            <button
              onClick={() => handleSheetChange(false)}
              className="text-muted-foreground text-lg leading-none opacity-95 transition hover:opacity-100"
            >
              ×
            </button>
          </div>

          {/* Calendário */}
          <div className="flex flex-col gap-4 px-5">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={{ before: today }}
              className="w-full p-0"
              locale={ptBR}
            />
          </div>

          {/* Horários */}
          {selectedDate && (
            <>
              <Separator />
              <div className="grid grid-cols-4 gap-3 px-5">
                {availableTimeSlots?.data?.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="rounded-full px-4 py-2"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>

              <Separator />

              {/* Resumo */}
              <div className="flex flex-col gap-3 px-5">
                <div className="border-border bg-card flex w-full flex-col gap-3 rounded-[10px] border border-solid p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-card-foreground text-base font-bold">
                      {service.name}
                    </p>
                    <p className="text-card-foreground text-sm font-bold">
                      R${priceInReaisInteger},00
                    </p>
                  </div>

                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <p>Data</p>
                    <p>{formattedDate}</p>
                  </div>

                  {selectedTime && (
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <p>Horário</p>
                      <p>{selectedTime}</p>
                    </div>
                  )}

                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <p>Barbearia</p>
                    <p>{service.barbershop.name}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-6">
                <Button
                  className="w-full rounded-full"
                  disabled={isConfirmDisabled || isPending}
                  onClick={handleConfirm}
                >
                  Confirmar
                </Button>
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
