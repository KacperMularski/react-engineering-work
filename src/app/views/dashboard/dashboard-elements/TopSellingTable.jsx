import {
  Avatar,
  Box,
  Card,
  FormControl,
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { Paragraph } from 'app/components/Typography';
import React, { useState } from 'react';

const CardHeader = styled(Box)(() => ({
  display: 'flex',
  paddingLeft: '24px',
  paddingRight: '24px',
  marginBottom: '12px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Title = styled('span')(() => ({
  fontSize: '1rem',
  fontWeight: '500',
  textTransform: 'capitalize',
}));

const ProductTable = styled(Table)(() => ({
  minWidth: 400,
  whiteSpace: 'pre',
  '& small': {
    width: 50,
    height: 15,
    borderRadius: 500,
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
  },
  '& td': { borderBottom: 'none' },
  '& td:first-of-type': { paddingLeft: '16px !important' },
}));

const Small = styled('small')(({ bgcolor }) => ({
  width: 50,
  height: 15,
  color: '#fff',
  padding: '2px 8px',
  borderRadius: '4px',
  overflow: 'hidden',
  background: bgcolor,
  boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
}));

const TopSellingTable = () => {
  const { palette } = useTheme();
  const bgError = palette.error.main;
  const bgPrimary = palette.primary.main;
  const bgSecondary = palette.secondary.main;

  const [topSellingMode, setTopSellingMode] = useState('month');
  let selectedData = '';

  const topSellingModeChangeHandler = (event) => {
    setTopSellingMode(event.target.value);
  };

  if (topSellingMode == 'month') {
    selectedData = servicesListMonth;
  }

  if (topSellingMode == 'total') {
    selectedData = servicesListTotal;
  }

  return (
    <Card elevation={3} sx={{ pt: '20px', mb: 3 }}>
      <CardHeader>
        <Title>Najczęściej wybierane usługi warsztatowe</Title>
        <FormControl>
          <Select size="small" value={topSellingMode} onChange={topSellingModeChangeHandler}>
            <MenuItem value="month">Ten miesiąc</MenuItem>
            <MenuItem value="total">Całościowo</MenuItem>
          </Select>
        </FormControl>
      </CardHeader>

      <Box overflow="auto">
        <ProductTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 3 }} colSpan={4}>
                Nazwa
              </TableCell>
              <TableCell sx={{ px: 3 }} colSpan={2}>
                Cena
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2}>
                Dostępność
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {selectedData.map((service, index) => (
              <TableRow key={index} hover>
                <TableCell colSpan={4} align="left" sx={{ px: 0, textTransform: 'capitalize' }}>
                  <Box display="flex" alignItems="center">
                    <Avatar src={service.imgUrl} />
                    <Paragraph sx={{ m: 0, ml: 4 }}>{service.name}</Paragraph>
                  </Box>
                </TableCell>

                <TableCell align="left" colSpan={2} sx={{ px: 3, textTransform: 'capitalize' }}>
                  {service.price}
                </TableCell>

                <TableCell sx={{ px: 0 }} align="left" colSpan={2}>
                  {service.available && service.available === 1 && (
                    <Small bgcolor={bgPrimary}>Natychmiast</Small>
                  )}
                  {service.available && service.available >= 2 && service.available < 7 && (
                    <Small bgcolor={bgSecondary}>Kilka dni</Small>
                  )}
                  {service.available && service.available >= 7 && (
                    <Small bgcolor={bgError}>Tydzień</Small>
                  )}
                  {!service.available && <Small bgcolor={bgError}>Brak</Small>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ProductTable>
      </Box>
    </Card>
  );
};

const servicesListTotal = [
  {
    imgUrl: '/assets/images/services/1-overwiew.jpg',
    name: 'Przegląd i badanie stanu technicznego pojazdu',
    price: 100,
    available: 1,
  },
  {
    imgUrl: '/assets/images/services/2-oil.jpg',
    name: 'Serwis olejowy i wymiana filtrów',
    price: 250,
    available: 4,
  },
  {
    imgUrl: '/assets/images/services/3-ac.png',
    name: 'Serwis klimatyzacji',
    price: 'od 150',
    available: 6,
  },
  {
    imgUrl: '/assets/images/services/4-paint.jpg',
    name: 'Naprawy blacharsko-lakiernicze',
    price: '-',
    available: 10,
  },
  {
    imgUrl: '/assets/images/services/5-repair.jpg',
    name: 'Wymiana zużytych lub niesprawnych częsci',
    price: '-',
    available: 7,
  },
];

const servicesListMonth = [
  {
    imgUrl: '/assets/images/services/6-tire.png',
    name: 'Wulkanizacja',
    price: 120,
    available: 2,
  },
  {
    imgUrl: '/assets/images/services/1-overwiew.jpg',
    name: 'Przegląd i badanie stanu technicznego pojazdu',
    price: 100,
    available: 1,
  },
  {
    imgUrl: '/assets/images/services/3-ac.png',
    name: 'Serwis klimatyzacji',
    price: 'od 150',
    available: 6,
  },
  {
    imgUrl: '/assets/images/services/2-oil.jpg',
    name: 'Serwis olejowy i wymiana filtrów',
    price: 250,
    available: 4,
  },
  {
    imgUrl: '/assets/images/services/5-repair.jpg',
    name: 'Wymiana zużytych lub niesprawnych częsci',
    price: '-',
    available: 7,
  },
];

export default TopSellingTable;
