const rootStyle = getComputedStyle(document.documentElement)
const rem2px = parseFloat(rootStyle.fontSize)
const minTooltipWidth = 6*rem2px
const maxDownMovement = rem2px
const tooltipOffset = -1
function makeTooltipTrigger(elem) {
  elem.classList.add('tooltiptrigger')
  elem.addEventListener('mouseover', function() {
    const parentRect = elem.getBoundingClientRect()
    let overflow = Math.max(parentRect.right + minTooltipWidth - window.innerWidth, 0)
    if (overflow > 0) {
      const niceOverflow = parentRect.width + tooltipOffset
      if (niceOverflow > overflow)
        overflow = niceOverflow
    }
    for (const tooltip of this.querySelectorAll('.tooltip')) {
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
      rect = tooltip.getBoundingClientRect()
      if (rect.bottom > window.innerHeight)
        tooltip.style.marginTop = `${top - rect.bottom + parentRect.y - tooltipOffset}px`
    }
  })
}
