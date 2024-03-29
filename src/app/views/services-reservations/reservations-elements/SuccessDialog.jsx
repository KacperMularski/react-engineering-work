import { Dialog, DialogContent } from '@mui/material';
import { Alert } from '@mui/material';

const SuccessDialog = ({ open, message }) => {
  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogContent>
        <Alert severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
