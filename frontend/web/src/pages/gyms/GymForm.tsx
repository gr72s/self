import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// import { Gym } from '@/types'; // Removing undefined import

// Defining interface locally to avoid dependency issues for now.
export interface GymFormData {
    name: string;
    description: string;
    location: string;
}

interface GymFormProps {
    initialData?: GymFormData;
    onSubmit: (data: GymFormData) => Promise<void>;
    submitLabel?: string;
}

export default function GymForm({ initialData, onSubmit, submitLabel = 'Save' }: GymFormProps) {
    const [formData, setFormData] = React.useState<GymFormData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        location: initialData?.location || '',
    });

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            console.error(err);
            setError('An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
                <Grid size={12}>
                    <Typography variant="h6" gutterBottom>
                        Gym Details
                    </Typography>
                </Grid>

                {error && (
                    <Grid size={12}>
                        <Typography color="error">{error}</Typography>
                    </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        required
                        fullWidth
                        id="name"
                        name="name"
                        label="Gym Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        id="location"
                        name="location"
                        label="Location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        fullWidth
                        id="description"
                        name="description"
                        label="Description"
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid size={12}>
                    <Button
                        disabled={loading}
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        {submitLabel}
                    </Button>
                </Grid>
            </Grid>
        </Box >
    );
}
