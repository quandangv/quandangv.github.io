const iconTemplate = '<svg width="{size}" height="{size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path style="fill:none;stroke:{stroke};stroke-width:{strokeWidth};stroke-linecap:round;stroke-linejoin:round" d="{path}"/></svg>'
const inlineIconTemplate = iconTemplate.replaceAll('{size}', '12').replaceAll('{stroke}', rootStyle.getPropertyValue('--colorFg')).replaceAll('{strokeWidth}', '6')
const bgInlineIconTemplate = iconTemplate.replaceAll('{size}', '12').replaceAll('{stroke}',rootStyle.getPropertyValue('--colorBg')).replaceAll('{strokeWidth}', '6')
const iconPaths = {enter:'M23,28 9,42 23,56 M52,9 V42 H9'}
const getIconUrl = (templateStr, pathStr) => `url("data:image/svg+xml,${encodeURIComponent(templateStr.replace('{path}', pathStr))}")`
const inlineIcons = structuredClone(iconPaths)
for (const name in inlineIcons)
  inlineIcons[name] = getIconUrl(inlineIconTemplate, iconPaths[name])
const bgInlineIcons = structuredClone(iconPaths)
for (const name in bgInlineIcons)
  bgInlineIcons[name] = getIconUrl(bgInlineIconTemplate, iconPaths[name])
