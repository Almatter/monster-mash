const paths:Record<string,string>={
 command:'M16 3 21 10 27 8 25 23 7 23 5 8 11 10 16 3Z M10 27h12 M16 12v8',
 curse:'M16 3 27 16 16 29 5 16 16 3Z M10 16h12 M16 10v12',
 legion:'M5 24v-8l5-5 5 5v8 M17 24v-8l5-5 5 5v8 M8 19h2 M21 19h2 M4 27h24',
 throne:'M4 23 2 10l7 4 7-9 7 9 7-4-2 13H4Z M6 27h20 M16 14v6',
 oblivion:'M3 16h19 M18 9l8 7-8 7 M5 9l4 7-4 7 M11 11l3 5-3 5',
 meteor:'M8 4l7 7 M4 11l8 4 M18 14l10 10-8 5-9-9 7-6Z M22 20l-4 4',
 vortex:'M26 15c-1-8-13-11-19-4-7 8 1 19 11 16 8-2 9-12 3-16-5-3-11 2-9 7 1 4 7 4 8 0',
 crimson:'M16 2v6 M16 24v6 M2 16h6 M24 16h6 M6 6l5 5 M21 21l5 5 M26 6l-5 5 M11 21l-5 5 M16 10l5 6-5 6-5-6 5-6Z',
 rendlunge:'M4 27l8-10 7 2 9-15-14 10 2 5-12 8Z M4 14l6 2 M18 25l5 3',
 maw:'M4 7l7 4 5-5 5 5 7-4-4 11-8 9-8-9L4 7Z M10 17l3-3 3 4 3-4 3 3',
 execution:'M7 26 24 5 M19 5h8v8 M5 20l7 7 M4 28h9 M16 22l5 5',
 frenzy:'M7 5l-3 17 5 6 M16 3l-4 18 4 8 M25 5l-5 17 5 6 M3 11l5-2 M12 9l5-2 M21 11l6-2',
 worldbreaker:'M16 3v9 M7 9l6 6-5 8 M25 9l-6 6 5 8 M3 27h26 M11 27l2-5 M21 27l-2-5',
 stampede:'M5 5l6 6-2 10 7 7 7-7-2-10 6-6 M11 11l5 3 5-3 M11 22l5-4 5 4',
 kingfall:'M3 22l15-11 M13 4l15 10-5 14-15-4-3-12 8-8Z M18 11l5 5-3 7 M8 20l-4 4',
 heavenfall:'M17 2l-2 13 M9 5l5 11 M25 4l-8 12 M5 23h22 M8 27h16 M11 19l5-4 5 4',
 rupture:'M16 3l4 8 8 1-5 6 4 9-10-3-8 5-1-10-6-5 10-2 4-9Z M12 13l7 8',
 devour:'M3 7l9 3 4 7 4-7 9-3-5 14-8 8-8-8L3 7Z M10 15l3 3 M22 15l-3 3',
 beam:'M2 16h28 M8 10l6 6-6 6 M17 9l7 7-7 7 M26 11v10',
 catastrophe:'M16 2l4 9 9-5-5 9 6 8-10-2-4 9-4-9-10 2 6-8-5-9 9 5 4-9Z M16 13v6 M13 16h6'
};
export function abilityIcon(id:string){const path=paths[id]||paths.catastrophe;return `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;}
