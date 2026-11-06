import { DEFAULT_SETTINGS, FONTS, FONT_SIZES, SETTINGS_STORAGE_KEY, THEMES } from './constants';

/**
 * Script kecil yang dijalankan SEBELUM halaman tampil (dipasang di <head> layout.tsx).
 * Tujuannya mencegah "kedip" tema terang saat pengguna memilih Dark/Pastel.
 */
export const themeInitScript = `(function(){try{
var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)})||'{}');
var themes=${JSON.stringify(THEMES.map((t) => t.value))};
var fonts=${JSON.stringify(FONTS.map((f) => f.value))};
var sizes=${JSON.stringify(FONT_SIZES.map((f) => f.value))};
var d=document.documentElement;
d.dataset.theme=themes.indexOf(s.theme)>-1?s.theme:${JSON.stringify(DEFAULT_SETTINGS.theme)};
d.dataset.font=fonts.indexOf(s.font)>-1?s.font:${JSON.stringify(DEFAULT_SETTINGS.font)};
d.dataset.size=sizes.indexOf(s.size)>-1?s.size:${JSON.stringify(DEFAULT_SETTINGS.size)};
}catch(e){}})();`;
