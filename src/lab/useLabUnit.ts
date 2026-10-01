import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { useLabUnitsQuery } from '../store/api/labApi';
import { unitChosen } from '../store/slices/labSlice';

// The unit the person is working on. Until they pick one, the first NRL
// department from the server is used.
export function useLabUnit() {
  const dispatch = useAppDispatch();
  const chosen = useAppSelector(st => st.lab.unit);
  const units = useLabUnitsQuery();

  useEffect(() => {
    if (!chosen && units.data?.length) {
      dispatch(unitChosen(units.data[0].key));
    }
  }, [chosen, units.data, dispatch]);

  const unit = units.data?.find(u => u.key === chosen) ?? units.data?.[0];
  return { unit, units: units.data ?? [], loading: units.isLoading, error: units.error };
}
