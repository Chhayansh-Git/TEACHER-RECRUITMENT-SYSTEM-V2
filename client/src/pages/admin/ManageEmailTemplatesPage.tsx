// src/pages/admin/ManageEmailTemplatesPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

// MUI Components
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface IEmailTemplate {
  _id: string;
  key: string;
  name: string;
  subject: string;
}

const fetchTemplates = async (): Promise<IEmailTemplate[]> => {
  const token = localStorage.getItem('token');
  const { data } = await api.get('/email-templates', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const deleteTemplate = async (id: string) => {
  const token = localStorage.getItem('token');
  const { data } = await api.delete(`/email-templates/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const ManageEmailTemplatesPage = () => {
  const queryClient = useQueryClient();
  const { data: templates, isLoading, isError } = useQuery<IEmailTemplate[]>({
    queryKey: ['emailTemplates'],
    queryFn: fetchTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success('Template deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
    onError: () => toast.error('Failed to delete template.'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to fetch email templates.</Alert>;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manage Email Templates</Typography>
        <Button component={RouterLink} to="/admin/email-templates/new" variant="contained" startIcon={<AddIcon />}>
          New Template
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Template Name</TableCell>
              <TableCell>Subject Line</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates?.map((template) => (
              <TableRow key={template._id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.subject}</TableCell>
                <TableCell align="right">
                  <Button component={RouterLink} to={`/admin/email-templates/edit/${template._id}`} sx={{ mr: 1 }}>Edit</Button>
                  <IconButton onClick={() => handleDelete(template._id)} color="error" disabled={deleteMutation.isPending}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};