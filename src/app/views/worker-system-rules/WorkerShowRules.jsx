import React, { useState, useEffect } from 'react';
import { SimpleCard, Breadcrumb } from 'app/components';
import { Box, styled } from '@mui/system';
import { Snackbar, Alert, Autocomplete, TextField, Stack } from '@mui/material';

import loadKnowledgeBase from './utils/loadKnowledgeBase';
import translateFieldName from './utils/translate';

const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}));

function WorkerShowRules() {
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueData, setSelectedIssueData] = useState(null);

  const [knowledgeBase, setKnowledgeBase] = useState([]);

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  const handleIssueChange = (issue) => {
    setSelectedIssue(issue);
  };

  useEffect(() => {
    if (selectedIssue) {
      const issueData = knowledgeBase.find((issue) => issue.issue === selectedIssue);
      setSelectedIssueData(issueData);
    }
  }, [selectedIssue, knowledgeBase]);

  useEffect(() => {
    let isMounted = true;

    const fetchRules = async () => {
      try {
        const knowledgeBase = await loadKnowledgeBase();
        if (isMounted) {
          setKnowledgeBase(knowledgeBase);
        }
      } catch (error) {
        setErrorSnackbarMessage('Błąd wczytywania reguł z bazy wiedzy: ', error);
        setOpenErrorSnackbar(true);
      }
    };

    fetchRules();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'Reguły' }]} />
      </Box>
      <Stack spacing={2}>
        <SimpleCard title="Lista reguł systemu decyzyjnego">
          <Autocomplete
            onChange={(event, value) => handleIssueChange(value)}
            options={knowledgeBase.map((item) => item.issue)}
            renderInput={(params) => <TextField {...params} label="Reguły" variant="outlined" />}
          />
        </SimpleCard>
        {selectedIssueData && selectedIssue && (
          <SimpleCard>
            <h3>{selectedIssueData.issue}</h3>
            <p>Rozwiązanie: {selectedIssueData.solution}</p>
            <ul>
              {selectedIssueData.symptomRequirements.map((requirement, index) => (
                <li key={index}>
                  {Object.entries(requirement).map(([key, value]) => (
                    <span key={key}>{translateFieldName(value)}</span>
                  ))}
                </li>
              ))}
            </ul>
            <p>Min. ilość objawów: {selectedIssueData.minSymptoms}</p>
          </SimpleCard>
        )}
      </Stack>
      <Snackbar open={openErrorSnackbar} autoHideDuration={4000} onClose={handleCloseErrorSnackbar}>
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          sx={{ width: '100%' }}
          variant="filled"
        >
          {errorSnackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default WorkerShowRules;
