import { Stack } from '@mui/material';
import { Box, styled } from '@mui/system';
import { Breadcrumb, SimpleCard } from 'app/components';
import RepairOrderForm from './RepairOrderForm';

const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}));

const RepairOrder = () => {
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'Utwórz nowe zlecenie' }]} />
      </Box>
      <Stack>
        <SimpleCard>
          <RepairOrderForm />
        </SimpleCard>
      </Stack>
    </Container>
  );
};

export default RepairOrder;
