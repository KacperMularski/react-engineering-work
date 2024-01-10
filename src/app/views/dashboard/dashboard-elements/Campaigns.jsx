import { Box } from '@mui/material';
import { MatxProgressBar, SimpleCard } from 'app/components';
import { Small } from 'app/components/Typography';

const Campaigns = () => {
  return (
    <Box>
      <SimpleCard title="Czas realizacji wybranych usług">
        <Small color="text.secondary">Obecnie</Small>
        <MatxProgressBar value={90} color="primary" text="Serwis olejowy" />
        <MatxProgressBar value={45} color="secondary" text="Wymiana opon" />
        <MatxProgressBar value={75} color="primary" text="Badania techniczne" />

        <Small color="text.secondary" display="block" pt={4}>
          Zeszły miesiąc
        </Small>
        <MatxProgressBar value={75} color="primary" text="Serwis olejowy" />
        <MatxProgressBar value={45} color="secondary" text="Wymiana opon" />
        <MatxProgressBar value={75} color="primary" text="Badania techniczne" />

        <Small color="text.secondary" display="block" pt={4}>
          Całościowo
        </Small>
        <MatxProgressBar value={75} color="primary" text="Serwis olejowy" />
        <MatxProgressBar value={45} color="secondary" text="Wymiana opon" />
        <MatxProgressBar value={75} color="primary" text="Badania techniczne" />
      </SimpleCard>
    </Box>
  );
};

export default Campaigns;
