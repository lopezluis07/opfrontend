import React from "react";
import { Box, Typography } from "@mui/material";

const MetricCard = ({ title, value }) => {
    return (
        <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: "8px", textAlign: "center" }}>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
        </Box>
    );
};

export default MetricCard;
