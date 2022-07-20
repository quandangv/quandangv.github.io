const rootStyle = getComputedStyle(document.documentElement)
const rem2px = parseFloat(rootStyle.fontSize)
const minTooltipWidth = 6*rem2px
const maxDownMovement = rem2px
const tooltipOffset = -1
const tooltipFont = parseFloat(rootStyle.getPropertyValue('--tooltipFont'))*rem2px
function makeTooltipTrigger(elem, tooltipText, positionElem) {
  if (!positionElem) positionElem = elem
  elem.classList.add('tooltiptrigger')
  const tooltip = document.createElement('span')
  tooltip.className = 'tooltip'
  tooltip.innerText = tooltipText || ''
  elem.tooltip = tooltip
  elem.appendChild(tooltip)
  function updatePos() {
    if (getComputedStyle(tooltip).opacity > 0) return
    const parentRect = positionElem.getBoundingClientRect()
    let overflow = Math.max(parentRect.right + minTooltipWidth - window.innerWidth, 0)
    if (overflow > 0) {
      const niceOverflow = parentRect.width + tooltipOffset
      if (niceOverflow > overflow)
        overflow = niceOverflow
    }
    for (const tooltip of elem.querySelectorAll(':scope > .tooltip')) { // use :scope to get direct child only
      let rect = tooltip.getBoundingClientRect()
      const diff = rect.x - parentRect.right - tooltipOffset
      const left = (parseFloat(tooltip.style.marginLeft) || 0)
      let top = (parseFloat(tooltip.style.marginTop) || 0)
      tooltip.style.marginLeft = `${left - overflow - diff}px`
      if (overflow > 0)
        top -= rect.y - parentRect.bottom - tooltipOffset
      else
        top -= rect.y - parentRect.y
      tooltip.style.marginTop = `${top}px`
      tooltip.style.transition = 'none'
      tooltip.style.fontSize = `${tooltipFont}px`
      rect = tooltip.getBoundingClientRect()
      tooltip.style.fontSize = 0
      tooltip.style.opacity = 0
      tooltip.offsetHeight // flush css
      tooltip.style.transition = null
      tooltip.style.fontSize = null
      tooltip.style.opacity = null
      if (rect.bottom > window.innerHeight)
        tooltip.style.marginTop = `${top - rect.bottom + parentRect.y - tooltipOffset}px`
    }
  }
  elem.triggerTooltip = function(timeout) {
    this.classList.toggle('triggered', true)
    setTimeout(updatePos, 1)
    setTimeout(function() {elem.classList.toggle('triggered', false)}, timeout)
  }
  elem.addEventListener('mouseover', updatePos)
  elem.addEventListener('touchstart', updatePos)
  elem.addEventListener('touchend', updatePos)
}
