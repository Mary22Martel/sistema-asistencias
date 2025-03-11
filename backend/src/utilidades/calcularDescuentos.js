export const calcularDescuento = (horaMarcacion, turno) => {
    const minutosTotales = horaMarcacion.getHours() * 60 + horaMarcacion.getMinutes();
  
    // 🔹 Mañana: Entrada después de 8:30
    if (turno === "mañana") {
      if (minutosTotales > 510 && minutosTotales <= 570) return 5; // 8:31 - 9:30
      if (minutosTotales > 570 && minutosTotales <= 630) return 10; // 9:31 - 10:30
      if (minutosTotales > 630) return 15; // Después de 10:30
    }
    // 🔹 Tarde: Entrada después de 15:00
    else if (turno === "tarde") {
      if (minutosTotales > 900 && minutosTotales <= 930) return 5; // 15:01 - 15:30
      if (minutosTotales > 930 && minutosTotales <= 990) return 10; // 15:31 - 16:30
      if (minutosTotales > 990) return 15; // Después de 16:30
    }
    return 0;
  };
  