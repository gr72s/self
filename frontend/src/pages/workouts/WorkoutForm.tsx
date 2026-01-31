import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { gymApi } from '@/services/api';
import type { GymResponse } from '@/types';

export interface WorkoutFormData {
    startTime: Dayjs | null;
    gymId: number | null;
    note: string;
}

interface WorkoutFormProps {
    initialData?: WorkoutFormData;
    onSubmit: (data: WorkoutFormData) => Promise<void>;
    submitLabel?: string;
}

export default function WorkoutForm({ initialData, onSubmit, submitLabel = 'Start Workout' }: WorkoutFormProps) {
    const [formData, setFormData] = React.useState<WorkoutFormData>({
        startTime: initialData?.startTime || dayjs(),
        gymId: initialData?.gymId || null,
        note: initialData?.note || '',
    });

    const [gyms, setGyms] = React.useState<GymResponse[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchGyms = async () => {
            try {
                const response = await gymApi.getAll();
                const data = (response.data as any).data || response.data;
                setGyms(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch gyms', err);
            }
        };
        fetchGyms();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setFormData(prev => ({ ...prev, startTime: newValue }));
    };

    const handleGymChange = (_event: any, newValue: GymResponse | null) => {
        setFormData(prev => ({ ...prev, gymId: newValue ? newValue.id : null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.gymId) {
            setError('Please select a gym');
            return;
        }
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <Typography variant="h6" gutterBottom>
                            Workout Details
                        </Typography>
                    </Grid>

                    {error && (
                        <Grid size={12}>
                            <Typography color="error">{error}</Typography>
                        </Grid>
                    )}

                    <Grid size={{ xs: 12, md: 6 }}>
                        <DateTimePicker
                            label="Start Time"
                            value={formData.startTime}
                            onChange={handleDateChange}
                            sx={{ width: '100%' }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            id="gym"
                            options={gyms}
                            getOptionLabel={(option) => option.name}
                            value={gyms.find(g => g.id === formData.gymId) || null}
                            onChange={handleGymChange}
                            renderInput={(params) => (
                                <TextField {...params} label="Gym" required />
                            )}
                        />
                    </Grid>

                    <Grid size={12}>
                        <TextField
                            fullWidth
                            id="note"
                            name="note"
                            label="Note"
                            multiline
                            rows={4}
                            value={formData.note}
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
        </LocalizationProvider>
    );
}
