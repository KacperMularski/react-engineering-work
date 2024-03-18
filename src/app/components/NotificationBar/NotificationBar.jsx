import { Badge, Button, Card, Drawer, Icon, IconButton, ThemeProvider } from '@mui/material';
import { Box, styled, useTheme } from '@mui/system';

import useSettings from 'app/hooks/useSettings';
import { sideNavWidth, topBarHeight } from 'app/utils/constant';
import { getTimeDifference } from 'app/utils/utils.js';
import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { themeShadows } from '../MatxTheme/themeColors';
import { Paragraph, Small } from '../Typography';
import useAuth from 'app/hooks/useAuth';
import {
  addDoc,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from 'firebase';

const Notification = styled('div')(() => ({
  padding: '16px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  height: topBarHeight,
  boxShadow: themeShadows[6],
  '& h5': {
    marginLeft: '8px',
    marginTop: 0,
    marginBottom: 0,
    fontWeight: '500',
  },
}));

const NotificationCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&:hover': {
    '& .messageTime': {
      display: 'none',
    },
    '& .deleteButton': {
      opacity: '1',
    },
  },
  '& .messageTime': {
    color: theme.palette.text.secondary,
  },
  '& .icon': { fontSize: '1.25rem' },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  opacity: '0',
  position: 'absolute',
  right: 5,
  marginTop: 9,
  marginRight: '24px',
  background: 'rgba(0, 0, 0, 0.01)',
}));

const CardLeftContent = styled('div')(({ theme }) => ({
  padding: '12px 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'rgba(0, 0, 0, 0.01)',
  '& small': {
    fontWeight: '500',
    marginLeft: '16px',
    color: theme.palette.text.secondary,
  },
}));

const Heading = styled('span')(({ theme }) => ({
  fontWeight: '500',
  marginLeft: '16px',
  color: theme.palette.text.secondary,
}));

const NotificationBar = ({ container }) => {
  const { settings } = useSettings();
  const theme = useTheme();
  const secondary = theme.palette.text.secondary;
  const [panelOpen, setPanelOpen] = React.useState(false);
  const { palette } = useTheme();
  const textColor = palette.text.primary;
  const handleDrawerToggle = () => {
    setPanelOpen(!panelOpen);
  };

  //Logika ładowania i usuwania powiadomień

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    const notificationsRef = collection(db, 'notifications');
    try {
      const uid = user.uid;
      let q;
      q = query(notificationsRef, where('uid', '==', uid));
      const getNotifications = await getDocs(q);
      const fetchedNotifications = getNotifications.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const deleteNotificationHandler = (value) => {
    deleteNotification(value);
  };

  const deleteNotification = async (notification) => {
    const deleteNotificationRef = doc(db, 'notifications', notification.id);
    try {
      await deleteDoc(deleteNotificationRef);
      fetchNotifications();
    } catch (error) {
      console.log('Błąd: ', error);
    }
  };

  const clearNotifications = async () => {
    const deleteAllNotificationsRef = collection(db, 'notifications');
    const uid = user.uid;
    try {
      const q = query(deleteAllNotificationsRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      fetchNotifications();
    } catch (error) {
      console.error('Błąd: ', error);
    }
  };

  return (
    <Fragment>
      <IconButton onClick={handleDrawerToggle}>
        <Badge color="secondary" badgeContent={notifications?.length}>
          <Icon sx={{ color: textColor }}>notifications</Icon>
        </Badge>
      </IconButton>

      <ThemeProvider theme={settings.themes[settings.activeTheme]}>
        <Drawer
          width={'100px'}
          container={container}
          variant="temporary"
          anchor={'right'}
          open={panelOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <Box sx={{ width: sideNavWidth }}>
            <Notification>
              <Icon color="primary">notifications</Icon>
              <h5>Powiadomienia</h5>
            </Notification>

            {notifications?.map((notification) => (
              <NotificationCard key={notification.id}>
                <DeleteButton
                  size="small"
                  className="deleteButton"
                  onClick={() => deleteNotificationHandler(notification)}
                >
                  <Icon className="icon">clear</Icon>
                </DeleteButton>

                <Card sx={{ mx: 2, mb: 3 }} elevation={3}>
                  <CardLeftContent>
                    <Box display="flex">
                      <Icon className="icon" color="primary">
                        chat
                      </Icon>
                      <Heading>Wiadomość</Heading>
                    </Box>
                    <Small className="messageTime">
                      {getTimeDifference(notification.data.dateTime.toDate())}
                      temu
                    </Small>
                  </CardLeftContent>
                  <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                    <Paragraph sx={{ m: 0 }}>{notification.data.type}</Paragraph>
                    <Small sx={{ color: secondary }}>{notification.data.content}</Small>
                  </Box>
                </Card>
              </NotificationCard>
            ))}
            {!!notifications?.length && (
              <Box sx={{ color: secondary }}>
                <Button onClick={clearNotifications}>Wyczyść powiadomienia</Button>
              </Box>
            )}
          </Box>
        </Drawer>
      </ThemeProvider>
    </Fragment>
  );
};

export default NotificationBar;
