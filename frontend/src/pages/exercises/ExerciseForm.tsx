import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { muscleApi } from '@/services/api';

export interface ExerciseFormData {
    name: string;
    originName: string;
    description: string;
    cues: string[];
    mainMuscles: number[]; // IDs
    supportMuscles: number[]; // IDs
}

interface ExerciseFormProps {
    initialData?: ExerciseFormData;
    onSubmit: (data: ExerciseFormData) => Promise<void>;
    submitLabel?: string;
}

export default function ExerciseForm({ initialData, onSubmit, submitLabel = 'Save' }: ExerciseFormProps) {
    const [formData, setFormData] = React.useState<ExerciseFormData>({
        name: initialData?.name || '',
        originName: initialData?.originName || '',
        description: initialData?.description || '',
        cues: initialData?.cues || [],
        mainMuscles: initialData?.mainMuscles || [],
        supportMuscles: initialData?.supportMuscles || [],
    });

    const [muscles, setMuscles] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchMuscles = async () => {
            try {
                const response = await muscleApi.getAll();
                const data = (response.data as any).data || response.data;
                setMuscles(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch muscles for selection', err);
            }
        };
        fetchMuscles();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMusclesChange = (field: 'mainMuscles' | 'supportMuscles') => (_event: any, newValue: any[]) => {
        setFormData(prev => ({ ...prev, [field]: newValue.map(m => m.id) }));
    };

    const handleCuesChange = (_event: any, newValue: string[]) => {
        setFormData(prev => ({ ...prev, cues: newValue }));
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
                        Exercise Details
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
                        label="Exercise Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
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
                    <Autocomplete
                        multiple
                        id="mainMuscles"
                        options={muscles}
                        getOptionLabel={(option) => option.name}
                        value={muscles.filter(m => formData.mainMuscles.includes(m.id))}
                        onChange={handleMusclesChange('mainMuscles')}
                        renderTags={(value: readonly any[], getTagProps) =>
                            value.map((option: any, index: number) => (
                                <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Main Muscles" placeholder="Muscles" />
                        )}
                    />
                </Grid>
                <Grid size={12}>
                    <Autocomplete
                        multiple
                        id="supportMuscles"
                        options={muscles}
                        getOptionLabel={(option) => option.name}
                        value={muscles.filter(m => formData.supportMuscles.includes(m.id))}
                        onChange={handleMusclesChange('supportMuscles')}
                        renderTags={(value: readonly any[], getTagProps) =>
                            value.map((option: any, index: number) => (
                                <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Support Muscles" placeholder="Muscles" />
                        )}
                    />
                </Grid>

                <Grid size={12}>
                    <Autocomplete
                        multiple
                        freeSolo
                        id="cues"
                        options={[]}
                        value={formData.cues}
                        onChange={handleCuesChange}
                        renderTags={(value: readonly string[], getTagProps) =>
                            value.map((option: string, index: number) => (
                                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Cues" placeholder="Type and press enter" />
                        )}
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
        </Box>
    );
}
