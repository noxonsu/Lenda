import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AdminSettings } from '../types';
import { Trans } from '@lingui/macro';
import { TreasuryWithdraw } from './TreasuryWithdraw';
import { LiquidationSettings } from './LiquidationSettings';

type Props = {
  disabled: boolean;
  settings: AdminSettings;
  onApply: (settings: AdminSettings) => void;
};

export const ContractSettings = ({ disabled }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const expandhandler = () => {
    setExpanded(!expanded);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={expandhandler}
      disabled={disabled}
      sx={{ alignSelf: 'stretch' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">
          <Trans>Contracts</Trans>
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ textAlign: 'start', display: 'flex' }}>
        <FormControl sx={{ flexGrow: 1, '& > *:not(:last-child)': { m: 0, mb: 2 } }}>
          <TreasuryWithdraw />
          <LiquidationSettings />
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
};
