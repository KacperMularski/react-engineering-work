import { Card, Grid, styled, useTheme } from '@mui/material';
import { Fragment } from 'react';
import Campaigns from './dashboard-elements/Campaigns';
import DoughnutChart from './dashboard-elements/Doughnut';
import StatCards from './dashboard-elements/StatCards';
import StatCards2 from './dashboard-elements/StatCards2';
import TopSellingTable from './dashboard-elements/TopSellingTable';

const ContentBox = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
}));

const Title = styled('span')(() => ({
  fontSize: '1rem',
  fontWeight: '500',
  marginRight: '.5rem',
  textTransform: 'capitalize',
}));

const SubTitle = styled('span')(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const Dashboard = () => {
  const { palette } = useTheme();

  return (
    <Fragment>
      <ContentBox className="analytics">
        <Grid container spacing={3}>
          <Grid item lg={8} md={8} sm={12} xs={12}>
            <StatCards />
            <TopSellingTable />
            <StatCards2 />
          </Grid>

          <Grid item lg={4} md={4} sm={12} xs={12}>
            <Card sx={{ px: 3, py: 2, mb: 3 }}>
              <Title>Sposób zgłaszania usterek</Title>
              <SubTitle>Dane z ostatnich 30 dni</SubTitle>

              <DoughnutChart
                height="300px"
                color={[palette.primary.dark, palette.primary.main, palette.primary.light]}
              />
            </Card>

            <Campaigns />
          </Grid>
        </Grid>
      </ContentBox>
    </Fragment>
  );
};

export default Dashboard;
