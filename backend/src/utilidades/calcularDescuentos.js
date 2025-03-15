// export const calcularDescuento = (fecha, turno) => {
//   const minutos = fecha.getHours() * 60 + fecha.getMinutes();
  
//   // Turno mañana (8:30 - 13:00)
//   if (turno === 'mañana') {
//     if (minutos < 510) return 0; // Antes de 8:30
//     if (minutos <= 570) return 5; // 8:30 - 9:30
//     if (minutos <= 630) return 10; // 9:31 - 10:30
//     return 15; // Después de 10:30
//   }
  
//   // Turno tarde (15:00 - 19:00)
//   if (minutos < 900) return 0; // Antes de 15:00
//   if (minutos <= 930) return 5; // 15:00 - 15:30
//   if (minutos <= 990) return 10; // 15:31 - 16:30
//   return 15; // Después de 16:30
// };