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
import { parseUnits, isAddress } from 'ethers/lib/utils';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useLendingPoolConfigurator } from '../hooks/useLendingPoolConfigurator';
import { Alert } from './Alert';
import { Button } from './Button';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const TreasuryWithdraw = () => {
  const { reserves } = useAppDataContext();
  const { currentAccount } = useWeb3Context();
  const { withdrawFromReserve, loading, error } = useLendingPoolConfigurator();

  const enabledReserves = reserves.filter((r) => r.isActive);

  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(currentAccount || '');
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const selectedReserve = enabledReserves.find((r) => r.underlyingAsset === selectedAsset);

  // Keep recipient in sync with wallet account changes unless user has edited it
  useEffect(() => {
    setRecipient(currentAccount || '');
  }, [currentAccount]);

  const handleAssetChange = (e: SelectChangeEvent) => {
    setSelectedAsset(e.target.value);
    setSuccess(false);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setAmountError(null);
    setSuccess(false);
  };

  const handleRecipientChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipient(value);
    setSuccess(false);
    if (value && (!isAddress(value) || value === ZERO_ADDRESS)) {
      setRecipientError('Invalid recipient address');
    } else {
      setRecipientError(null);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedReserve || !amount || !recipient) return;
    if (!isAddress(recipient) || recipient === ZERO_ADDRESS) {
      setRecipientError('Invalid recipient address');
      return;
    }
    setSuccess(false);
    try {
      const amountBN = parseUnits(amount, selectedReserve.decimals).toString();
      await withdrawFromReserve(selectedAsset, amountBN, recipient);
      setSuccess(true);
      setAmount('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // parseUnits throws synchronously — surface it locally; hook errors are shown via hook.error
      if (!msg.includes('Wallet not connected') && !msg.includes('Wrong network')) {
        setAmountError(msg);
      }
    }
  };

  const submitDisabled =
    loading || !selectedAsset || !amount || !recipient || !!recipientError || !!amountError;

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
            error={!!amountError}
            helperText={amountError}
          />
          <TextField
            label={<Trans>Recipient address</Trans>}
            value={recipient}
            onChange={handleRecipientChange}
            disabled={loading}
            type="text"
            error={!!recipientError}
            helperText={recipientError}
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
