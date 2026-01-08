export type TicketCell = number | null;

export type TicketRow = [
  TicketCell,
  TicketCell,
  TicketCell,
  TicketCell,
  TicketCell,
  TicketCell,
  TicketCell,
  TicketCell,
  TicketCell
];

export type Ticket = [TicketRow, TicketRow, TicketRow];

export const TICKET_COLUMN_RANGES = [
  { min: 1, max: 9 }, // Col 1
  { min: 10, max: 19 }, // Col 2
  { min: 20, max: 29 }, // Col 3
  { min: 30, max: 39 }, // Col 4
  { min: 40, max: 49 }, // Col 5
  { min: 50, max: 59 }, // Col 6
  { min: 60, max: 69 }, // Col 7
  { min: 70, max: 79 }, // Col 8
  { min: 80, max: 90 }, // Col 9
] as const;

export const GAME_CONSTANTS = {
  GRID_ROWS: 3,
  GRID_COLS: 9,
  NUMS_PER_ROW: 5,
  TOTAL_NUMBERS: 15,
} as const;
