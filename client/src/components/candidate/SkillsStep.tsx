// src/components/candidate/SkillsStep.tsx

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProfileFormInputs } from '../../pages/candidate/CompleteProfilePage';

// Predefined skills for consistency. This list would be extensive in a real app.
const skillOptions = [
  'Classroom Management',
  'Lesson Planning',
  'Curriculum Development',
  'Student Assessment',
  'Public Speaking',
  'Microsoft Office',
  'Google Workspace',
  'Online Teaching',
  'Special Needs Education',
  'Early Childhood Education'
];

export const SkillsStep = () => {
  const { control } = useFormContext<ProfileFormInputs>();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Professional Skills
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select your skills from the list. You can also type to search.
      </Typography>
      <Controller
        name="skills"
        control={control}
        defaultValue={[]}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            multiple
            options={skillOptions}
            getOptionLabel={(option) => option}
            value={value}
            onChange={(_, newValue) => onChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label="Skills"
                placeholder="Select your skills"
              />
            )}
          />
        )}
      />
    </>
  );
};