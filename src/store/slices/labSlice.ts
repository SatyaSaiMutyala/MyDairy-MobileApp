import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Phase } from '../api/labApi';

// Which record the Lab screen is looking at. Home reads the unit too, for
// its Opening and Closing cards.
type LabView = {
  unit: string | null; // unit key; null until the units have loaded
  date: string; // 'YYYY-MM-DD'
  phase: Phase;
};

const pad = (n: number) => String(n).padStart(2, '0');
const d = new Date();
export const todayIso = () => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const initialState: LabView = { unit: null, date: todayIso(), phase: 'opening' };

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    unitChosen(state, action: PayloadAction<string>) {
      state.unit = action.payload;
    },
    dateChosen(state, action: PayloadAction<string>) {
      state.date = action.payload;
    },
    phaseChosen(state, action: PayloadAction<Phase>) {
      state.phase = action.payload;
    },
  },
});

export const { unitChosen, dateChosen, phaseChosen } = labSlice.actions;
export default labSlice.reducer;
