"use client";

import { SplashConfig } from "../config";
import {
  Box,
  Container,
  CssBaseline,
  GlobalStyles,
  Grid,
  Paper,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";

export default function App({
  title,
  apps,
  theme,
}: Pick<SplashConfig, "apps" | "theme" | "title">) {
  const appTheme = createTheme({
    palette: {
      primary: {
        main: theme.primary,
      },
      secondary: {
        main: theme.secondary,
      },
    },
  });

  return (
    <ThemeProvider theme={appTheme}>
      <GlobalStyles
        styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
      />
      <CssBaseline />
      <Container
        disableGutters
        maxWidth="lg"
        component="main"
        sx={{ pt: 8, pb: 6, backgroundColor: appTheme.palette.primary.main }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "baseline",
            padding: 5,
          }}
        >
          <Typography component="h2" variant="h3" color="text.primary">
            {title ?? "Available applications"}
          </Typography>
        </Box>
        <Grid
          container
          spacing={2}
          sx={{
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {apps.map(({ link, icon, name, displayName }, idx) => (
            <Grid key={idx} sx={{ margin: 2.5, display: "flex" }}>
              <Paper sx={{ padding: 2.5, textAlign: "center" }}>
                <Tooltip title={link}>
                  <img style={{ width: 150 }} src={icon} alt={name} />
                </Tooltip>
                <Typography component="div" variant="h5">
                  {displayName ?? ""}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
