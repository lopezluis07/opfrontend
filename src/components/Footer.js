import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
    return (
        <Box
            sx={{
                backgroundColor: '#f5f5f5',
                padding: '10px 0',
                position: 'relative',
                bottom: 0,
                width: '100%',
                textAlign: 'center',
            }}
        >
            <Container>
                <Typography variant="body2" color="textSecondary">
                    Copyright © {new Date().getFullYear()} Colomich S.A.S - Buenos Aires. Todos los derechos reservados.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Versión 1.0
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
