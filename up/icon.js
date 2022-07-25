'use strict';
const iconTemplate = '<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><path style="fill:none;stroke:{stroke};stroke-width:{strokeWidth};stroke-linecap:round;stroke-linejoin:round" d="{path}"/></svg>'
const iconPaths = {enter:'M26,28 12,42 26,56M49,9V42H12'}
const getIconUrl = (templateStr, pathStr) => `url("data:image/svg+xml,${encodeURIComponent(templateStr.replace('{path}', pathStr))}")`
function updateIcons() {
  const inlineIconTemplate = iconTemplate.replaceAll('{size}', '12').replaceAll('{stroke}', rootStyle.getPropertyValue('--colorFg')).replaceAll('{strokeWidth}', '6')
  const bgInlineIconTemplate = iconTemplate.replaceAll('{size}', '12').replaceAll('{stroke}',rootStyle.getPropertyValue('--colorBg')).replaceAll('{strokeWidth}', '6')
  for (const name in iconPaths)
    theme.setProperty('--icon-'+name, getIconUrl(inlineIconTemplate, iconPaths[name]))
  for (const name in iconPaths)
    theme.setProperty('--bg-icon-'+name, getIconUrl(bgInlineIconTemplate, iconPaths[name]))
  console.log(bgInlineIconTemplate.replace('{path}', iconPaths.enter))
}
updateIcons()
