import { ChangeEvent, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Trans } from '@lingui/macro';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useLendingPoolConfigurator } from '../hooks/useLendingPoolConfigurator';
import { Alert } from './Alert';
import { Button } from './Button';

export const LiquidationSettings = () => {
  const { reserves } = useAppDataContext();
  const { configureReserveAsCollateral, loading, error } = useLendingPoolConfigurator();

  const enabledReserves = reserves.filter((r) => r.isActive);

  const [selectedAsset, setSelectedAsset] = useState('');
  const [ltv, setLtv] = useState('');
  const [threshold, setThreshold] = useState('');
  const [bonus, setBonus] = useState('');
  const [success, setSuccess] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const selectedReserve = enabledReserves.find((r) => r.underlyingAsset === selectedAsset);

  // Populate current values when reserve is selected
  useEffect(() => {
    if (!selectedReserve) return;
    setLtv(selectedReserve.baseLTVasCollateral);
    setThreshold(selectedReserve.reserveLiquidationThreshold);
    setBonus(selectedReserve.reserveLiquidationBonus);
    setSuccess(false);
  }, [selectedAsset]);

  const handleAssetChange = (e: SelectChangeEvent) => {
    setSelectedAsset(e.target.value);
    setSuccess(false);
  };

  const handleApply = async () => {
    if (!selectedAsset || !ltv || !threshold || !bonus) return;
    setSuccess(false);
    try {
      await configureReserveAsCollateral(selectedAsset, ltv, threshold, bonus);
      setSuccess(true);
    } catch {
      // error is already set in hook
    }
  };

  const submitDisabled = loading || !selectedAsset || !ltv || !threshold || !bonus;

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h5">
          <Trans>Liquidation Settings</Trans>
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ textAlign: 'start', display: 'flex' }}>
        <FormControl sx={{ flexGrow: 1, '& > *:not(:last-child)': { m: 0, mb: 2 } }}>
          <Select
            value={selectedAsset}
            onChange={handleAssetChange}
            displayEmpty
            disabled={loading}
          >
            <MenuItem value="" disabled>
              <Trans>Select asset</Trans>
            </MenuItem>
            {enabledReserves.map((r) => (
              <MenuItem key={r.underlyingAsset} value={r.underlyingAsset}>
                {r.symbol}
              </MenuItem>
            ))}
          </Select>
          {selectedReserve && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <Trans>Current</Trans>: LTV {selectedReserve.baseLTVasCollateral} / Threshold{' '}
              {selectedReserve.reserveLiquidationThreshold} / Bonus{' '}
              {selectedReserve.reserveLiquidationBonus} (basis points)
            </Typography>
          )}
          <TextField
            label={<Trans>LTV (basis points, e.g. 8000 = 80%)</Trans>}
            value={ltv}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setLtv(e.target.value);
              setSuccess(false);
            }}
            disabled={loading}
            type="number"
            inputProps={{ min: 0, max: 10000 }}
          />
          <TextField
            label={<Trans>Liquidation Threshold (basis points, e.g. 8500 = 85%)</Trans>}
            value={threshold}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setThreshold(e.target.value);
              setSuccess(false);
            }}
            disabled={loading}
            type="number"
            inputProps={{ min: 0, max: 10000 }}
          />
          <TextField
            label={<Trans>Liquidation Bonus (basis points, e.g. 10500 = 5% bonus)</Trans>}
            value={bonus}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setBonus(e.target.value);
              setSuccess(false);
            }}
            disabled={loading}
            type="number"
            inputProps={{ min: 10000 }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">
              <Trans>Settings applied successfully</Trans>
            </Alert>
          )}
          <Button onClick={handleApply} disabled={submitDisabled} sx={{ alignSelf: 'center' }}>
            {loading ? <Trans>Processing...</Trans> : <Trans>Apply</Trans>}
          </Button>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
};
