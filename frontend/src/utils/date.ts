export const parseAsUTc = (dateTime: string) => {
  return new Date(`${dateTime}+00:00`); // append timezone
};
