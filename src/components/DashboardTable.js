import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Box,
    Typography,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const DashboardTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fumigacionData, setFumigacionData] = useState([]);
    const [currentMonthData, setCurrentMonthData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch("https://appsupervisores.juxn3.com/api/dashboard", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Filtrar datos para el mes actual
                const currentMonth = new Date().toLocaleString("es-ES", { month: "long" });
                const filteredData = result.filter(
                    (row) => row.mes.toLowerCase() === currentMonth.toLowerCase()
                );

                // Modificar los jornales: dividir por 9.2
                const adjustedData = filteredData.map((row) => ({
                    ...row,
                    jornales: parseFloat((row.jornales / 9.2).toFixed(2)),
                }));

                setCurrentMonthData(adjustedData);

                // Filtrar datos de "Fumigación Foliar" para la gráfica (todos los meses)
                const fumigacionFilteredData = result
                    .filter((row) => row.actividad_nombre === "Fumigación Foliar")
                    .map((row) => ({
                        mes: row.mes,
                        total_litros: row.total_litros,
                        total_arboles: row.total_arboles,
                    }));
                setFumigacionData(fumigacionFilteredData);

                setData(result);
            } catch (error) {
                console.error("Error al obtener datos del Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Tabla de actividades (solo datos del mes actual) */}
            <TableContainer component={Paper} sx={{ mt: 4, maxWidth: 800, margin: "0 auto" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>Actividad</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>Jornales</TableCell>                            
                            <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>Días</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>Litros</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>Árboles Aplicados</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>Árboles Fertilizados</TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>Kilos Aplicados</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentMonthData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>{row.actividad_nombre}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>{row.jornales}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>{row.dias}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>{row.total_litros}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>{row.total_arboles}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>{row.total_fertilizados}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", padding: "8px" }}>{row.total_kilos}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Gráfica de Fumigación Foliar (todos los meses) */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h6" gutterBottom>
                    Gráfica de Fumigación Foliar por Meses
                </Typography>
                <BarChart
                    width={800}
                    height={400}
                    data={fumigacionData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_litros" fill="#8884d8" name="Litros Aplicados" />
                    <Bar dataKey="total_arboles" fill="#82ca9d" name="Árboles Aplicados" />
                </BarChart>
            </Box>
        </Box>
    );
};

export default DashboardTable;
