一、背景
由于组件库中的基础组件具有很多可配置项，demo 无法涵盖所有情况，因此在某些业务场景中，无法快速确定当前的基础组件是否满足需求。期望能够直接在文档网站上修改 demo 代码，以验证某些功能。
为了满足这个需求，我们可以考虑在文档网站上提供一个在线编码环境，让用户可以直接修改 demo 代码并实时查看结果。这样，用户就可以在不离开文档网站的情况下，快速验证基础组件是否满足其需求，并根据需要进行调整。
二、价值

1. 提供了一套统一的 Demo 在线预览解决方案，适用于公司各组件库和基建项目。
2. 支持在线 Demo 的实时预览和调试，相较于以前需要启动本地项目进行调试，显著提高了代码调试效率。
3. 对于一些复杂的配置项调试，可以直接在在线预览中进行实时调试，并即时看到结果。这使得使用者对具体配置项有了更直观的理解，从而大幅降低了学习成本。
   三、技术方案
   使用 vue 的 repl 在线预览组件：https://github.com/vuejs/repl
   [图片]
   引入方式

- 使用线上服务的方式预览，通过 url hash 拼接编码压缩后的源码来展示在线 demo；
- 代码库使用 iframe 嵌入到网页中；
  流程图
  暂时无法在 RoboTeam 文档外展示此内容
  实时渲染预览原理
  使用 vue/compiler-sfc 将用户输入代码（.vue）编译为 js 代码，使用 babelParse 将代码转为 ast 进行各种校验，无误后使用 postMessage 与渲染 iframe 交互，iframe 删除旧 script 标签重新插入从而实现实时预览
  Url Hash 传输压缩源码到页面原理
  目的
- demo 在线预览的父应用通过 iframe 传递 url hash 传递目标源码 到在线 Demo 预览服务；
- 通过 URL 存储需要展示的源码数据；

Url Hash 传输压缩源码 Demo
iframe 中嵌入的 url：
http://127.0.0.1:5173/#eNp9UctOwzAQ/JXFl4BUmgOcqhQJUCXgAAgQJ19Cug0ujm3Zm9Aqyr+zdtTHAfXmnZkdz2h7cevctGtRzEQRKq8cQUBqHejS1HMpKEhxI41qnPUEPXhcwQArbxvIeC2TRprKmkDQhBrmkT/PHlBrC5+l10hn2YU0RT56sxMPhI3TJSFPAMVSdekB0PfJZBjGsehKf/nVElkDtHXIaZxXTem3HGmvLfKDbDTMR8ciP/pHTLgJ51yperoO1nDdPoqlqGzjlEb/4khxDylmkJjIlVzj9ylh5Fuc7PDqG6uff/B12ERMilePAX2HUuw5Kn2NNNKL92fc8HtPNnbZalafIN8wWN3GjKPsrjVLjn2kS2kf06GUqT/CYkNowq5UDBqVQ9JLwce7P1H9EPdqep32pBnE8AeyFLn1
在线的 demo 预览服务通过 url 解析出源码

<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('Hello Varlet!')
</script>

<template>
  <div>
    {{ msg }}
    <var-button type="primary">{{ msg }}</var-button>
  </div>
</template>

Url Hash 编解码和压缩原理
这里调用了 atou 方法，用于解码数据，还有一个与之相对的 utoa，用于编码数据。
整个过程的核心是使用了 base64 编码和压缩算法。在存储阶段，数据首先经过 base64 编码，然后使用 zlib 压缩算法进行压缩。压缩后的数据再转换为二进制字符串，最终使用 btoa 方法将二进制字符串编码为 Base64 字符串。而在读取阶段，则按照相反的过程进行解码和解压缩。

- 存储阶段：strToU8 => zlibSync => strFromU8 => btoa
- 读取阶段：atob => strToU8 => unzlibSync => strFromU8
  读取是存储的一个逆向过程。压缩和解压缩使用了开源框架 fflate – 号称是目前最快、最小、最通用的纯 JavaScript 压缩和解压库。

repl 加解密源码
store.ts
//加密
const serialize: ReplStore['serialize'] = () => {
const files = getFiles()
const importMap = files[importMapFile]
if (importMap) {
const parsed = JSON.parse(importMap)
const builtin = builtinImportMap.value.imports || {}

      if (parsed.imports) {
        for (const [key, value] of Object.entries(parsed.imports)) {
          if (builtin[key] === value) {
            delete parsed.imports[key]
          }
        }
        if (parsed.imports && !Object.keys(parsed.imports).length) {
          delete parsed.imports
        }
      }
      if (parsed.scopes && !Object.keys(parsed.scopes).length) {
        delete parsed.scopes
      }
      if (Object.keys(parsed).length) {
        files[importMapFile] = JSON.stringify(parsed, null, 2)
      } else {
        delete files[importMapFile]
      }
    }
    if (vueVersion.value) files._version = vueVersion.value
    return '#' + utoa(JSON.stringify(files))

}
//解密
const deserialize: ReplStore['deserialize'] = (serializedState: string) => {
if (serializedState.startsWith('#'))
serializedState = serializedState.slice(1)
const saved = JSON.parse(atou(serializedState))
for (const filename in saved) {
if (filename === '\_version') {
vueVersion.value = saved[filename]
} else {
setFile(files.value, filename, saved[filename])
}
}
}
utils.ts
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'

export function debounce(fn: Function, n = 100) {
let handle: any
return (...args: any[]) => {
if (handle) clearTimeout(handle)
handle = setTimeout(() => {
fn(...args)
}, n)
}
}
//编码+压缩
export function utoa(data: string): string {
const buffer = strToU8(data)
const zipped = zlibSync(buffer, { level: 9 })
const binary = strFromU8(zipped, true)
return btoa(binary)
}
//解码+解压
export function atou(base64: string): string {
const binary = atob(base64)

// zlib header (x78), level 9 (xDA)
if (binary.startsWith('\x78\xDA')) {
const buffer = strToU8(binary, true)
const unzipped = unzlibSync(buffer)
return strFromU8(unzipped)
}

// old unicode hacks for backward compatibility
// https://base64.guru/developers/javascript/examples/unicode-strings
return decodeURIComponent(escape(binary))
}

局限性
常见浏览器对 URL 字节数限制如下：

URL 字节数限制
源码字节数限制 (预计)
源码行数限制 (预计)
Chrome
2097152
(2MB)
1398000

46600

Safari
80000
53000
1760
IE
2083
1388
47
Firefox
65536
43690
1460
四、接入指南
其他组件库接入
需要先将代码打包为一个完整的 ES 模块文件，并提供可访问的链接地址。同时，还需要提供所有外部依赖的可访问地址，建议将它们统一放置在 static.jiduapp.cn/jidu_unpkg 下。

暂时不支持 css 预处理器，如果使用了预处理器的，如 less 或 scss 可以使用在线工具将代码转为 css 并去掉 lang="scss" 或 lang="less"
less playground
Scss palyground
[图片]

Vue 展示在线 Demo
<template>
<iframe class="iframe-dom" :src="playgroundUrl"></iframe>
</template>
// 入参是想要展示 demo 的源码

<script setup lang="ts">
    const openPlayground = (sourceCode) => {
        const file = { 
            'App.vue': decodeURIComponent(sourceCode),
            'import-map.json': JSON.stringify({ imports: { a: '123' } }),
        }
        // baseUrl为在线demo服务的url前缀
        playgroundUrl.value = `${baseUrl}${utoa(JSON.stringify(file))}`
    }
</script>

编码和加密
export function utoa(data: string): string {
return btoa(unescape(encodeURIComponent(data)))
}
