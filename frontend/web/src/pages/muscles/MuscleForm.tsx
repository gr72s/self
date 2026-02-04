import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export interface MuscleFormData {
    name: string;
    description: string;
    function?: string;
    originName?: string;
}

interface MuscleFormProps {
    initialData?: MuscleFormData;
    onSubmit: (data: MuscleFormData) => Promise<void>;
    submitLabel?: string;
}

export default function MuscleForm({ initialData, onSubmit, submitLabel = 'Save' }: MuscleFormProps) {
    const [formData, setFormData] = React.useState<MuscleFormData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        function: initialData?.function || '',
        originName: initialData?.originName || '',
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
                        Muscle Details
                    </Typography>
                </Grid>

                {error && (
                    <Grid size={12}>
                        <Typography color="error">{error}</Typography>
                    </Grid>
                )}

                <Grid size={12}>
                    <TextField
                        required
                        fullWidth
                        id="name"
                        name="name"
                        label="Muscle Name"
                        value={formData.name}
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
                    <TextField
                        fullWidth
                        id="function"
                        name="function"
                        label="Function"
                        value={formData.function}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        fullWidth
                        id="originName"
                        name="originName"
                        label="Origin Name"
                        value={formData.originName}
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
        </Box>
    );
}
