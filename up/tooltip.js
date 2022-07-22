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
  elem.tooltip.updatePos = function() {
    let tooltipVisible = false
    if (parseFloat(getComputedStyle(tooltip).fontSize) > 1)
      tooltipVisible = true
    const parentRect = positionElem.getBoundingClientRect()
    let overflow = Math.max(parentRect.right + minTooltipWidth - window.innerWidth, 0)
    if (overflow > 0) {
      const niceOverflow = parentRect.width + tooltipOffset
      if (niceOverflow > overflow)
        overflow = niceOverflow
    }
    for (const tooltip of elem.querySelectorAll(':scope > .tooltip')) /*scope*/ {
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
      if (tooltipVisible !== true) /*tooltipVisible*/ {
        tooltip.style.fontSize = 0
        tooltip.style.padding = 0
        tooltip.style.borderColor = 'transparent'
        tooltip.offsetHeight // flush css
      }
      tooltip.style.transition = null
      tooltip.style.fontSize = null
      tooltip.style.padding = null
      tooltip.style.borderColor = null
      if (rect.bottom > window.innerHeight)
        tooltip.style.marginTop = `${top - rect.bottom + parentRect.y - tooltipOffset}px`
    }
    // scope: use :scope to get direct child only and avoid disturbing children's tooltips
    // tooltipVisible: if tooltip is not visible, reset the tooltip animations after updating
  }
  elem.triggerTooltip = function(timeout) {
    this.classList.toggle('triggered', true)
    setTimeout(elem.tooltip.updatePos, 1)
    setTimeout(function() {elem.classList.toggle('triggered', false)}, timeout)
  }
  elem.addEventListener('mouseenter', elem.tooltip.updatePos)
  elem.addEventListener('touchstart', elem.tooltip.updatePos)
  elem.addEventListener('touchend', elem.tooltip.updatePos)
  setTimeout(() => {
    for (let parent = elem.parentNode; parent && parent.nodeType === Node.ELEMENT_NODE; parent = parent.parentNode) {
      const style = getComputedStyle(parent)
      if (style.overflowY == 'scroll' || style.overflowY == 'auto') {
        parent.addEventListener('scroll', function() {
          const style = getComputedStyle(elem.tooltip)
          if (parseFloat(style.fontSize) > 1)
            elem.tooltip.updatePos()
        })
      }
    }
  }, 1)
}
