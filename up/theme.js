'use strict';
const colorList = ['pink', 'blue', 'red', 'lightBlue', 'cyan']
const theme = document.documentElement.style
function setTheme({color, dark}={}) {
  dark = dark && dark !== 'light' ? 'dark-' : ''
  theme.setProperty('--color1', `var(--${dark}${color})`)
  theme.setProperty('--color1Hover', `var(--${dark}${color}Hover)`)
  theme.setProperty('--color1Focus', `var(--${dark}${color}Focus)`)
  theme.setProperty('--selColor', `var(--${dark}${color}Sel)`)
  theme.setProperty('--colorBg', `var(--${dark}${color}Bg)`)
  theme.setProperty('--colorFg', `var(--${dark?'dark':'light'}Fg)`)
  updateIcons()
  return 'Theme changed!'
}
const rootStyle = getComputedStyle(document.documentElement)
