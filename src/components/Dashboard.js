import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box
} from '@mui/material';
import NavigationBar from './Navbar'; // Tu Navbar
import DashboardTable from './DashboardTable'; // La tabla
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const DashboardComponent = () => {
    const [metrics, setMetrics] = useState({
        lluvia: 0,
        horasTrabajadas: 0,
        rendimiento: 0,
        litrosAplicados: 0,
        arbolesAplicados: 0,
    });

    const [chartData, setChartData] = useState([]); // Datos para el gráfico

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://18.205.204.20:3001/api/dashboard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                // Filtrar datos para el mes actual
                const currentMonth = new Date().toLocaleString("es-ES", { month: "long" });
                const currentMonthData = result.filter(
                    (row) => row.mes.toLowerCase() === currentMonth.toLowerCase()
                );

                if (currentMonthData.length === 0) {
                    console.warn("No hay datos para el mes actual.");
                }

                // Calcular métricas solo para el mes actual


                const litrosAplicados = currentMonthData.reduce((acc, item) => acc + (parseFloat(item.total_litros) || 0), 0);
                const arbolesAplicados = currentMonthData.reduce((acc, item) => acc + (parseFloat(item.total_arboles) || 0), 0);
                const lluvia = result
                    .filter((row) => row.mes.toLowerCase() === currentMonth.toLowerCase())
                    .reduce((acc, item) => acc + (parseFloat(item.horas_lluvia) || 0), 0);
                const horasTrabajadas = currentMonthData.reduce((acc, item) => acc + (parseFloat(item.jornales) || 0), 0);

                // Calcular rendimiento promedio (previniendo divisiones por cero)
                const rendimiento = horasTrabajadas > 0
                    ? ((litrosAplicados / horasTrabajadas) * 100).toFixed(2)
                    : 0;

                // Actualizar el estado con las métricas del mes actual
                setMetrics({
                    lluvia: parseFloat(lluvia.toFixed(2)),
                    horasTrabajadas: parseFloat(horasTrabajadas.toFixed(2)),
                    rendimiento: parseFloat(rendimiento),
                    litrosAplicados: parseFloat(litrosAplicados.toFixed(2)),
                    arbolesAplicados: parseFloat(arbolesAplicados.toFixed(2)),
                });

                // Usar todos los datos para el gráfico
                setChartData(result);
            } catch (error) {
                console.error('Error cargando métricas:', error);
            }
        };

        fetchMetrics();
    }, []);

    return (
        <Box>
            {/* Navbar */}
            <NavigationBar />

            {/* Contenido del Dashboard */}
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>

                {/* Métricas principales */}
                <Grid container spacing={3} sx={{ mt: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Cantidad de Lluvia
                                </Typography>
                                <Typography variant="h4">{metrics.lluvia.toLocaleString()} hrs</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Horas Trabajadas
                                </Typography>
                                <Typography variant="h4">{metrics.horasTrabajadas.toLocaleString()} hrs</Typography>
                            </CardContent>
                        </Card>
                    </Grid>


                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Litros Aplicados
                            </Typography>
                            <Typography variant="h4">{metrics.litrosAplicados.toLocaleString()} L</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Árboles Aplicados
                            </Typography>
                            <Typography variant="h4">{metrics.arbolesAplicados.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabla */}
            <div style={{ marginTop: '32px' }}>
                <Typography variant="h6" gutterBottom>
                    Detalle de Actividades
                </Typography>
                <DashboardTable />
            </div>
        </Container>
                    </Box >
                    );
};



export default DashboardComponent;