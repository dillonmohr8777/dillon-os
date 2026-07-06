import React, {createContext, useContext} from 'react';
import {C} from './theme';

// Per-track visual identity. The IMMOHRTAL night base stays constant across
// videos; accents/washes/motifs give each track its own vibe.
export type TrackPalette = {
  accentA: string; // primary highlight (active word gradient top, glows)
  accentB: string; // secondary highlight (active word gradient bottom)
  softA: string; // particle / soft glow variant of accentA
  softB: string; // particle / soft glow variant of accentB
  washA: string; // radial background wash (rgba)
  washB: string; // radial background wash (rgba)
};

export const BRAND_PALETTE: TrackPalette = {
  accentA: C.green,
  accentB: C.blue,
  softA: C.greenSoft,
  softB: C.blueSoft,
  washA: 'rgba(53, 167, 255, 0.20)',
  washB: 'rgba(53, 209, 143, 0.16)',
};

const TrackThemeContext = createContext<TrackPalette>(BRAND_PALETTE);

export const TrackThemeProvider: React.FC<{
  palette: TrackPalette;
  children: React.ReactNode;
}> = ({palette, children}) => (
  <TrackThemeContext.Provider value={palette}>{children}</TrackThemeContext.Provider>
);

export const useTrackPalette = (): TrackPalette => useContext(TrackThemeContext);
