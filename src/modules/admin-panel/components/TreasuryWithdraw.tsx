import { ChangeEvent, useState } from 'react';
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
import { parseUnits } from 'ethers/lib/utils';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useLendingPoolConfigurator } from '../hooks/useLendingPoolConfigurator';
import { Alert } from './Alert';
import { Button } from './Button';

export const TreasuryWithdraw = () => {
  const { reserves } = useAppDataContext();
  const { currentAccount } = useWeb3Context();
  const { withdrawFromReserve, loading, error } = useLendingPoolConfigurator();

  const enabledReserves = reserves.filter((r) => r.isActive);

  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(currentAccount || '');
  const [success, setSuccess] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const selectedReserve = enabledReserves.find((r) => r.underlyingAsset === selectedAsset);

  const handleAssetChange = (e: SelectChangeEvent) => {
    setSelectedAsset(e.target.value);
    setSuccess(false);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setSuccess(false);
  };

  const handleRecipientChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
    setSuccess(false);
  };

  const handleWithdraw = async () => {
    if (!selectedReserve || !amount || !recipient) return;
    setSuccess(false);
    const amountBN = parseUnits(amount, selectedReserve.decimals).toString();
    try {
      await withdrawFromReserve(selectedAsset, amountBN, recipient);
      setSuccess(true);
      setAmount('');
    } catch {
      // error is already set in hook
    }
  };

  const submitDisabled = loading || !selectedAsset || !amount || !recipient;

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">
          <Trans>Treasury Withdraw</Trans>
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
          <TextField
            label={<Trans>Amount</Trans>}
            value={amount}
            onChange={handleAmountChange}
            disabled={loading}
            type="number"
            inputProps={{ min: 0 }}
          />
          <TextField
            label={<Trans>Recipient address</Trans>}
            value={recipient}
            onChange={handleRecipientChange}
            disabled={loading}
            type="text"
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">
              <Trans>Withdrawn successfully</Trans>
            </Alert>
          )}
          <Button onClick={handleWithdraw} disabled={submitDisabled} sx={{ alignSelf: 'center' }}>
            {loading ? <Trans>Processing...</Trans> : <Trans>Withdraw</Trans>}
          </Button>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
};
