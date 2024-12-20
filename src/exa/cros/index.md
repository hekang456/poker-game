// Load css from the federation module
export function loadFederationCss(modules) {
const styleContainer = document.createElement('div')

for (let index = 0; index < modules.length; index++) {
const cssurl = modules[index]

    const hrefs = window[cssurl] || []

    hrefs.forEach((href: string) => {
      const link = document.createElement('link')
      link.href = `${href}?_t=${new Date().getTime()}`
      link.rel = 'stylesheet'
      link.crossOrigin = 'anonymous'

      styleContainer.appendChild(link)
    })

}

document.body.appendChild(styleContainer)
}

import { onBeforeMount } from 'vue'

onBeforeMount(() => {
loadFederationCss([
'css__crmModule__./MfInit',
'css__crmModule__./UserInfo',
'css__crmModule__./CarInfo',
])
})
